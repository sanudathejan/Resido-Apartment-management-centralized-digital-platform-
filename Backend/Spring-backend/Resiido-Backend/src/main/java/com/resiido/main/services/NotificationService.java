package com.resiido.main.services;

import com.resiido.main.models.User;
import com.resiido.main.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired
    private UserRepository userRepository;

    public void sendSosNotifications(User requester) {
        String houseNum = requester.getRequestedHouseNumber(); // e.g., "1-05" or "G-02"
        if (houseNum == null) return;

        // Extract Floor (everything before the dash)
        String floor = houseNum.split("-")[0];

        // 1. Find all Managers
        List<User> managers = userRepository.findAll().stream()
                .filter(u -> "MANAGER".equalsIgnoreCase(u.getRole()))
                .collect(Collectors.toList());

        // 2. Find Residents on the same floor
        List<User> floorNeighbors = userRepository.findAll().stream()
                .filter(u -> "RESIDENT".equalsIgnoreCase(u.getRole()))
                .filter(u -> u.getRequestedHouseNumber() != null && u.getRequestedHouseNumber().startsWith(floor + "-"))
                .filter(u -> !u.getId().equals(requester.getId())) // Don't notify the requester
                .collect(Collectors.toList());

        // Dispatch to Managers
        managers.forEach(m -> dispatchMockPushNotification(
                m.getEmail(),
                "🚨 SOS ALERT",
                "Resident " + requester.getName() + " in House " + houseNum + " needs help!"
        ));

        // Dispatch to Neighbors
        floorNeighbors.forEach(n -> dispatchMockPushNotification(
                n.getEmail(),
                "⚠️ NEIGHBOR EMERGENCY",
                "Your neighbor in " + houseNum + " (Floor " + floor + ") has triggered an SOS!"
        ));
    }

    private void dispatchMockPushNotification(String email, String title, String body) {
        // This simulates sending to a smartphone via Firebase
        System.out.println("--------------------------------------------------");
        System.out.println("[PUSH NOTIFICATION SENT TO: " + email + "]");
        System.out.println("TITLE: " + title);
        System.out.println("BODY: " + body);
        System.out.println("--------------------------------------------------");
    }
}