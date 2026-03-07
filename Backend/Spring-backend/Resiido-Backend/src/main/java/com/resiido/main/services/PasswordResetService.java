package com.resiido.main.services;

import com.resiido.main.models.PasswordResetToken;
import com.resiido.main.models.User;
import com.resiido.main.repositories.PasswordResetTokenRepository;
import com.resiido.main.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.resetPassword.baseUrl:http://localhost:3000}")
    private String baseUrl;

    public PasswordResetService(UserRepository userRepository,
                                PasswordResetTokenRepository tokenRepository,
                                JavaMailSender mailSender,
                                PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.mailSender = mailSender;
        this.passwordEncoder = passwordEncoder;
    }

    // SEND EMAIL
    public void sendResetLink(String email) {

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return;

        tokenRepository.deleteByEmail(email);

        String token = UUID.randomUUID().toString();

        PasswordResetToken prt = new PasswordResetToken();
        prt.setToken(token);
        prt.setEmail(email);
        prt.setExpiresAt(LocalDateTime.now().plusMinutes(15));
        prt.setUsed(false);

        tokenRepository.save(prt);
        System.out.println("RESET TOKEN SAVED FOR: " + email);
        System.out.println("RESET TOKEN: " + token);


        String link = baseUrl + "/reset-password?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Resiido Password Reset");
        message.setText(
                "Hello,\n\n" +
                        "You requested to reset your password.\n" +
                        "Use the link below to reset it:\n\n" +
                        link + "\n\n" +
                        "This link will expire in 15 minutes.\n\n" +
                        "If you did not request this, please ignore this email."
        );

        mailSender.send(message);
    }

    // RESET PASSWORD USING TOKEN
    public void resetPassword(String token, String newPassword) {
        System.out.println("RESET PASSWORD CALLED");
        System.out.println("TOKEN RECEIVED: " + token);

        if (token == null || token.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reset token is required");
        }

        if (newPassword == null || newPassword.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password is required");
        }

        if (newPassword.length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 8 characters");
        }

        PasswordResetToken passwordResetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid token"));

        if (passwordResetToken.isUsed()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token already used");
        }

        if (passwordResetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token expired");
        }

        User user = userRepository.findByEmail(passwordResetToken.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Mark token as used so it cannot be reused
        passwordResetToken.setUsed(true);
        tokenRepository.save(passwordResetToken);

        // Optional cleanup:
        // tokenRepository.deleteByEmail(passwordResetToken.getEmail());
    }
}




