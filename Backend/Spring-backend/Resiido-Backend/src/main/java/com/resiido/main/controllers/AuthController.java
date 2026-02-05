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

import java.util.Map;
import java.util.Random;

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

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Normalize Role
        String role = (user.getRole() != null && !user.getRole().isEmpty())
                ? user.getRole().toUpperCase() : "RESIDENT";
        user.setRole(role);
        user.setVerified(false); // all users need to be verified

        // Generate Code
        String code = String.format("%05d", new Random().nextInt(100000));
        user.setVerificationCode(code);

        // --- RESIDENT LOGIC ---
        if ("RESIDENT".equals(role)) {
            String houseNum = user.getRequestedHouseNumber();
            if (houseNum == null || houseNum.isEmpty()) {
                return ResponseEntity.badRequest().body("Residents must select a house number (e.g., '1-05').");
            }

            // Check if House exists
            House house = houseRepository.findByHouseNumber(houseNum)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "House " + houseNum + " does not exist."));

            // Check if House is taken (by a verified user)
            if (house.getResident() != null) {
                return ResponseEntity.badRequest().body("House " + houseNum + " is already taken.");
            }

            // Doesn't assign the house yet. We wait for verification.
            userRepository.save(user);
            emailService.sendVerificationCodeToManagers(user.getName(), "RESIDENT", houseNum, code);

            return ResponseEntity.ok("Request sent! Managers have been notified. Ask a manager for your code.");
        }

        // --- MANAGER LOGIC ---
        else {
            userRepository.save(user);
            emailService.sendVerificationCodeToManagers(user.getName(), "MANAGER", "N/A", code);
            return ResponseEntity.ok("Manager request sent! Ask an existing manager for your code.");
        }
    }

    @PostMapping("/verify-account")
    @Transactional
    public ResponseEntity<String> verifyAccount(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String code = payload.get("code");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.isVerified()) {
            return ResponseEntity.badRequest().body("User is already verified.");
        }

        if (code.equals(user.getVerificationCode())) {

            String successMessage;

            // --- RESIDENT LOGIC ---
            if ("RESIDENT".equals(user.getRole())) {
                String houseNum = user.getRequestedHouseNumber();

                // 1. Assign House
                House house = houseRepository.findByHouseNumber(houseNum)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "House not found"));

                if (house.getResident() != null) {
                    return ResponseEntity.badRequest().body("House was taken while you were waiting.");
                }

                house.setResident(user);
                houseRepository.save(house);

                // 2. Assign Matching Parking Slot
                String expectedSlot = "P-" + houseNum;
                ParkingSlot slot = parkingSlotRepository.findBySlotNumber(expectedSlot);

                if (slot != null) {
                    slot.setOwner(user);
                    parkingSlotRepository.save(slot);
                }

                successMessage = "Verification successful! Housing and Parking assigned.";
            }
            // --- MANAGER LOGIC ---
            else {
                successMessage = "Verification successful! Manager account activated.";
            }

            // Common Final Steps
            user.setVerified(true);
            user.setVerificationCode(null); // Clear code after use
            userRepository.save(user);

            return ResponseEntity.ok(successMessage);

        } else {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid Verification Code.");
        }
    }

    @PostMapping("/login")
    public String login(@RequestBody AuthRequest authRequest) {
        User user = userRepository.findByEmail(authRequest.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!user.isVerified()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account not verified.");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword())
        );

        return jwtUtil.generateToken(authRequest.getEmail());
    }
}