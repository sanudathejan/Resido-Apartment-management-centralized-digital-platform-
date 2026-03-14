package com.resiido.main.controllers;

import com.resiido.main.models.SosAlert;
import com.resiido.main.models.User;
import com.resiido.main.repositories.SosRepository;
import com.resiido.main.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import com.resiido.main.services.NotificationService;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/sos")
public class SosController {

    @Autowired
    private SosRepository sosRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    // Helper: Get logged-in user
    private User getLoggedInUser(Principal principal) {
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    // 1. Trigger SOS
    @PostMapping
    public SosAlert triggerSos(Principal principal) {
        User currentUser = getLoggedInUser(principal);

        SosAlert alert = new SosAlert();
        alert.setResident(currentUser); // Auto-link to current resident
        alert.setTimestamp(LocalDateTime.now());
        alert.setActive(true);

        SosAlert savedAlert = sosRepository.save(alert);

        // TRIGGER NOTIFICATIONS
        notificationService.sendSosNotifications(currentUser);

        return savedAlert;
    }

    // 2. View Active Alerts (Managers & Residents need to see this)
    @GetMapping("/active")
    public List<SosAlert> getActiveAlerts() {
        return sosRepository.findByIsActiveTrue();
    }

    // 3. Clear/Deactivate SOS (Secure: Only Managers or the Owner)
    @PutMapping("/{id}/clear")
    public SosAlert clearSos(@PathVariable Long id, Principal principal) {
        User currentUser = getLoggedInUser(principal);

        SosAlert alert = sosRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alert not found"));

        // Security Check: Only MANAGER or the person who triggered it can clear it
        boolean isManager = "MANAGER".equalsIgnoreCase(currentUser.getRole());
        boolean isOwner = alert.getResident().getId().equals(currentUser.getId());

        if (!isManager && !isOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot clear this alert.");
        }

        alert.setActive(false);
        return sosRepository.save(alert);
    }

    // 4. Resident: View my own SOS history
    @GetMapping("/my-history")
    public List<SosAlert> getMyHistory(Principal principal) {
        User currentUser = getLoggedInUser(principal);
        return sosRepository.findByResident(currentUser);
    }
}