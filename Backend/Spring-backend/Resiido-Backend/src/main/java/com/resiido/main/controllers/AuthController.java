package com.resiido.main.controllers;

import com.resiido.main.models.AuthRequest;
import com.resiido.main.models.User;
import com.resiido.main.repositories.UserRepository;
import com.resiido.main.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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

    // 1. REGISTER (this creates users with Hashed Passwords)
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
        }

        // Hash the password before saving!
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        // Check if a role was provided in JSON.
        // If yes, use it (and uppercase it). If no, default to "RESIDENT".
        if (user.getRole() != null && !user.getRole().isEmpty()) {
            user.setRole(user.getRole().toUpperCase());
        } else {
            user.setRole("RESIDENT");
        }
        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully!");
    }

    // 2. LOGIN (Generates the Token)
    @PostMapping("/login")
    public String login(@RequestBody AuthRequest authRequest) {
        // This authenticates the user. If password fails, it throws an exception automatically.
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword())
        );

        // If it gets here, the user is valid. Generate token!
        return jwtUtil.generateToken(authRequest.getEmail());
    }
}