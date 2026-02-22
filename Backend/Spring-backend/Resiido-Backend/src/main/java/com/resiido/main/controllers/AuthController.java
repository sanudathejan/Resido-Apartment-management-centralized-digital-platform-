package com.resiido.main.controllers;

import com.resiido.main.models.AuthRequest;
import com.resiido.main.models.House;
import com.resiido.main.models.ParkingSlot;
import com.resiido.main.models.User;
import com.resiido.main.repositories.HouseRepository;
import com.resiido.main.repositories.ParkingSlotRepository;
import com.resiido.main.repositories.UserRepository;
import com.resiido.main.security.JwtUtil;
import com.resiido.main.services.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.Map;
import java.util.Random;

import com.resiido.main.dtos.ForgotPasswordRequest;
import com.resiido.main.dtos.ResetPasswordRequest;
import com.resiido.main.services.PasswordResetService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private UserRepository userRepository;
    @Autowired private HouseRepository houseRepository;
    @Autowired private ParkingSlotRepository parkingSlotRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private EmailService emailService;
    @Autowired private PasswordResetService passwordResetService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        String role = (user.getRole() != null && !user.getRole().isEmpty()) ? user.getRole().toUpperCase() : "RESIDENT";
        user.setRole(role);
        user.setVerified(false);
        String code = String.format("%05d", new Random().nextInt(100000));
        user.setVerificationCode(code);

        if ("RESIDENT".equals(role)) {
            String houseNum = user.getRequestedHouseNumber();
            if (houseNum == null || houseNum.isEmpty()) return ResponseEntity.badRequest().body("Residents must select a house number.");
            House house = houseRepository.findByHouseNumber(houseNum).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "House " + houseNum + " does not exist."));
            if (house.getResident() != null) return ResponseEntity.badRequest().body("House " + houseNum + " is already taken.");
            userRepository.save(user);
            emailService.sendVerificationCodeToManagers(user.getName(), "RESIDENT", houseNum, code);
            return ResponseEntity.ok("Request sent! Managers notified.");
        } else {
            userRepository.save(user);
            emailService.sendVerificationCodeToManagers(user.getName(), "MANAGER", "N/A", code);
            return ResponseEntity.ok("Manager request sent!");
        }
    }

    @PostMapping("/verify-account")
    @Transactional
    public ResponseEntity<String> verifyAccount(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String code = payload.get("code");
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (user.isVerified()) return ResponseEntity.badRequest().body("User is already verified.");
        if (code.equals(user.getVerificationCode())) {
            String successMessage;
            if ("RESIDENT".equals(user.getRole())) {
                String houseNum = user.getRequestedHouseNumber();
                House house = houseRepository.findByHouseNumber(houseNum).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "House not found"));
                if (house.getResident() != null) return ResponseEntity.badRequest().body("House was taken while you were waiting.");
                house.setResident(user);
                houseRepository.save(house);
                String expectedSlot = "P-" + houseNum;
                ParkingSlot slot = parkingSlotRepository.findBySlotNumber(expectedSlot);
                if (slot != null) {
                    slot.setOwner(user);
                    parkingSlotRepository.save(slot);
                }
                successMessage = "Verification successful! Housing and Parking assigned.";
            } else {
                successMessage = "Verification successful! Manager account activated.";
            }
            user.setVerified(true);
            user.setVerificationCode(null);
            userRepository.save(user);
            return ResponseEntity.ok(successMessage);
        } else {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid Verification Code.");
        }
    }

    @PostMapping("/login")
    public String login(@RequestBody AuthRequest authRequest) {
        User user = userRepository.findByEmail(authRequest.getEmail()).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        if (!user.isVerified()) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account not verified.");
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword()));
        return jwtUtil.generateToken(authRequest.getEmail());
    }

    //DELETE USER (Safe Unlink)
    @DeleteMapping("/delete/{id}")
    @Transactional
    public ResponseEntity<String> deleteAccount(@PathVariable Long id, Principal principal) {
        User currentUser = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        User targetUser = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Target user not found"));

        // PERMISSION CHECK
        boolean isSelfDelete = currentUser.getId().equals(targetUser.getId());
        boolean isManager = "MANAGER".equalsIgnoreCase(currentUser.getRole());

        // 1. If you are NOT a manager and NOT deleting yourself, you are forbidden.
        if (!isManager && !isSelfDelete) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: You can only delete your own account.");
        }

        // 2. SAFE UNLINK
        if (targetUser.getHouse() != null) {
            House h = targetUser.getHouse();
            h.setResident(null); // The house becomes empty
            houseRepository.save(h);
        }

        if (targetUser.getParkingSlot() != null) {
            ParkingSlot ps = targetUser.getParkingSlot();
            ps.setOwner(null); // The slot becomes empty
            parkingSlotRepository.save(ps);
        }

        // 3. Delete the User
        userRepository.delete(targetUser);

        return ResponseEntity.ok("User account deleted safely. Housing and Parking slots are now empty.");
    }
}