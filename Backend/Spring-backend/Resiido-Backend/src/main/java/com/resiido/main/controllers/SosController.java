package com.resiido.main.controllers;

import com.resiido.main.models.SosAlert;
import com.resiido.main.repositories.SosRepository;
import com.resiido.main.models.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/sos")
public class SosController {

    @Autowired
    private SosRepository sosRepository;

    // 1. Trigger an SOS Alert
    @PostMapping("/{residentId}")
    public SosAlert triggerSos(@PathVariable Long residentId) {
        SosAlert alert = new SosAlert();

        // Create a "dummy" user object with just the ID to link the relationship
        User resident = new User();
        resident.setId(residentId);

        alert.setResident(resident);
        alert.setTimestamp(LocalDateTime.now()); // Sets exact current time
        alert.setActive(true);

        return sosRepository.save(alert);
    }

    // 2. View all active SOS alerts (For Managers and nearby Residents)
    @GetMapping("/active")
    public List<SosAlert> getActiveAlerts() {
        return sosRepository.findByIsActiveTrue();
    }

    // 3. Deactivate/Clear an SOS (When help arrives)
    @PutMapping("/{id}/clear")
    public SosAlert clearSos(@PathVariable Long id) {
        SosAlert alert = sosRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert not found"));
        alert.setActive(false);
        return sosRepository.save(alert);
    }
}