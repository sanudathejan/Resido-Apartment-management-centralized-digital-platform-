package com.resiido.main.controllers;

import com.resiido.main.models.AuthRequest;
import com.resiido.main.models.User;
import com.resiido.main.repositories.UserRepository;
import com.resiido.main.security.JwtUtil;
import com.resiido.main.services.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private EmailService emailService;

    // 1. REGISTER
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Set Role
        if (user.getRole() != null && !user.getRole().isEmpty()) {
            user.setRole(user.getRole().toUpperCase());
        } else {
            user.setRole("RESIDENT");
        }

        // --- NEW LOGIC START ---
        if ("MANAGER".equals(user.getRole())) {
            // Managers start as Unverified
            user.setVerified(false);

            // Generate 5-digit code
            String code = String.format("%05d", new Random().nextInt(100000));
            user.setVerificationCode(code);

            userRepository.save(user);

            // Send Email to existing managers
            emailService.sendVerificationCodeToManagers(user.getName(), code);

            return ResponseEntity.ok("Manager registered! Verification code sent to existing managers. Please verify.");
        } else {
            // Residents are automatically verified
            user.setVerified(true);
            userRepository.save(user);
            return ResponseEntity.ok("Resident registered successfully!");
        }
    }

    // 2. VERIFY MANAGER (New Endpoint)
    @PostMapping("/verify-manager")
    public ResponseEntity<String> verifyManager(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String code = payload.get("code");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!"MANAGER".equals(user.getRole())) {
            return ResponseEntity.badRequest().body("Only managers need verification.");
        }

        if (user.isVerified()) {
            return ResponseEntity.badRequest().body("User is already verified.");
        }

        if (code.equals(user.getVerificationCode())) {
            user.setVerified(true);
            user.setVerificationCode(null); // Clear code after use
            userRepository.save(user);
            return ResponseEntity.ok("Manager verified successfully! You can now login.");
        } else {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid Verification Code.");
        }
    }

    // 3. LOGIN
    @PostMapping("/login")
    public String login(@RequestBody AuthRequest authRequest) {
        // Check if user exists and is verified BEFORE authenticating
        User user = userRepository.findByEmail(authRequest.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!user.isVerified()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account not verified. Please contact an admin.");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword())
        );

        return jwtUtil.generateToken(authRequest.getEmail());
    }
}