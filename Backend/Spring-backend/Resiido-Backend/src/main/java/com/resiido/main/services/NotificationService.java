package com.resiido.main.services;

import com.resiido.main.models.Notification;
import com.resiido.main.models.User;
import com.resiido.main.repositories.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public void createNotification(User user, String title, String message) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setRead(false);

        notificationRepository.save(notification);
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public void sendSosNotifications(User user) {
        createNotification(
                user,
                "SOS Alert Triggered",
                "Emergency SOS alert has been triggered."
        );
    }
}
