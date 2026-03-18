package com.resiido.main.services;

import com.resiido.main.models.User;
import com.resiido.main.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired
    private UserRepository userRepository;

    // We will use RestTemplate to send the HTTP POST to Expo
    private final RestTemplate restTemplate = new RestTemplate();
    private final String EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

    public void sendSosNotifications(User requester) {
        String houseNum = requester.getRequestedHouseNumber();
        if (houseNum == null) return;

        String floor = houseNum.split("-")[0];

        // 1. Find all Managers WITH push tokens
        List<User> managers = userRepository.findAll().stream()
                .filter(u -> "MANAGER".equalsIgnoreCase(u.getRole()))
                .filter(u -> u.getExpoPushToken() != null && !u.getExpoPushToken().isEmpty())
                .collect(Collectors.toList());

        // 2. Find Residents on same floor WITH push tokens
        List<User> floorNeighbors = userRepository.findAll().stream()
                .filter(u -> "RESIDENT".equalsIgnoreCase(u.getRole()))
                .filter(u -> u.getRequestedHouseNumber() != null && u.getRequestedHouseNumber().startsWith(floor + "-"))
                .filter(u -> !u.getId().equals(requester.getId()))
                .filter(u -> u.getExpoPushToken() != null && !u.getExpoPushToken().isEmpty())
                .collect(Collectors.toList());

        // Dispatch to Managers
        managers.forEach(m -> sendRealPushNotification(
                m.getExpoPushToken(),
                "🚨 SOS ALERT",
                "Resident " + requester.getName() + " in House " + houseNum + " needs help!"
        ));

        // Dispatch to Neighbors
        floorNeighbors.forEach(n -> sendRealPushNotification(
                n.getExpoPushToken(),
                "⚠️ NEIGHBOR EMERGENCY",
                "Your neighbor in " + houseNum + " (Floor " + floor + ") has triggered an SOS!"
        ));
    }

    private void sendRealPushNotification(String pushToken, String title, String body) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Construct the Expo Push payload
            Map<String, Object> payload = new HashMap<>();
            payload.put("to", pushToken);
            payload.put("sound", "default");
            payload.put("title", title);
            payload.put("body", body);

            // You can pass extra data to route the app when the notification is tapped
            Map<String, String> data = new HashMap<>();
            data.put("type", "SOS_ALERT");
            payload.put("data", data);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

            // Send to Expo!
            restTemplate.postForObject(EXPO_PUSH_URL, request, String.class);
            System.out.println("Push sent successfully to: " + pushToken);

        } catch (Exception e) {
            System.err.println("Failed to send push to " + pushToken + ": " + e.getMessage());
        }
    }
}