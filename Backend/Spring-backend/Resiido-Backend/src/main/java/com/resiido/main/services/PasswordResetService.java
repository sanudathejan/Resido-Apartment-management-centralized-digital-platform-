package com.resiido.main.services;

import com.resiido.main.models.PasswordResetToken;
import com.resiido.main.models.User;
import com.resiido.main.repositories.PasswordResetTokenRepository;
import com.resiido.main.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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

        String link = baseUrl + "/reset-password?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Resiido Password Reset");
        message.setText("Reset your password using link:\n" + link);

        mailSender.send(message);
    }

    // RESET PASSWORD
    public void resetPassword(String token, String newPassword) {

        PasswordResetToken prt = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        if (prt.isUsed())
            throw new RuntimeException("Token already used");

        if (prt.getExpiresAt().isBefore(LocalDateTime.now()))
            throw new RuntimeException("Token expired");

        User user = userRepository.findByEmail(prt.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        prt.setUsed(true);
        tokenRepository.save(prt);
    }
}




