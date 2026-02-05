package com.resiido.main.services;

import com.resiido.main.models.User;
import com.resiido.main.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private UserRepository userRepository;

    public void sendVerificationCodeToManagers(String newManagerName, String verificationCode) {
        // 1. Find all existing managers
        List<User> managers = userRepository.findAll().stream()
                .filter(u -> "MANAGER".equals(u.getRole()))
                .toList();

        String subject = "New Manager Registration Request: " + newManagerName;
        String body = "A new manager (" + newManagerName + ") is trying to register.\n\n" +
                "Please provide them with this verification code to complete their registration:\n\n" +
                "CODE: " + verificationCode + "\n\n" +
                "If you did not authorize this, please ignore this email.";

        // 2. Loop through managers and send email individually (so one bad email doesn't stop others)
        for (User manager : managers) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(manager.getEmail());
                message.setSubject(subject);
                message.setText(body);
                message.setFrom("exampleresidence1@gmail.com");

                mailSender.send(message);
                System.out.println("✅ Email sent to manager: " + manager.getEmail());
            } catch (Exception e) {
                // Ignore invalid emails as requested, except log it
                System.err.println("⚠️ Failed to send email to: " + manager.getEmail() + " (Skipping)");
            }
        }
    }
}