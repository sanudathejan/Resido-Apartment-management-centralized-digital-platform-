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

    public void sendVerificationCodeToManagers(String newUserName, String role, String requestedHouse, String verificationCode) {
        List<User> managers = userRepository.findAll().stream()
                .filter(u -> "MANAGER".equals(u.getRole()) && u.isVerified())
                .toList();

        String subject = "New " + role + " Registration Request";
        String bodyDetails = "";

        if ("RESIDENT".equals(role)) {
            bodyDetails = "User " + newUserName + " wants to register for House: " + requestedHouse + ".\n";
        } else {
            bodyDetails = "User " + newUserName + " wants to register as a MANAGER.\n";
        }

        String body = bodyDetails +
                "Please provide them with this code to complete their registration:\n\n" +
                "CODE: " + verificationCode + "\n\n" +
                "If you did not authorize this, ignore this email.";

        for (User manager : managers) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(manager.getEmail());
                message.setSubject(subject);
                message.setText(body);
                message.setFrom("exampleresidence1@gmail.com");
                mailSender.send(message);
            } catch (Exception e) {
                System.err.println("⚠️ Failed to send to: " + manager.getEmail());
            }
        }
    }

    public void sendPasswordResetOtp(String userEmail, String verificationCode) {
        String subject = "ResiiDo - Password Reset Code";

        String body = "Hello,\n\n" +
                "We received a request to reset the password for your ResiiDo account.\n" +
                "Please use the 6-digit code below to complete the reset process:\n\n" +
                "CODE: " + verificationCode + "\n\n" +
                "If you did not request a password reset, you can safely ignore this email.\n\n" +
                "Best regards,\n" +
                "The ResiiDo Team";

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(userEmail);
            message.setSubject(subject);
            message.setText(body);
            message.setFrom("exampleresidence1@gmail.com");
            mailSender.send(message);
            System.out.println("✅ Password reset OTP sent successfully to: " + userEmail);
        } catch (Exception e) {
            System.err.println("⚠️ Failed to send password reset email to: " + userEmail);
            e.printStackTrace(); // Helpful to see exactly why it failed if it does
        }
    }
}