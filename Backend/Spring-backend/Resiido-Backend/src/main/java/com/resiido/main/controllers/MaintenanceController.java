package com.resiido.main.controllers;

import com.resiido.main.models.MaintenanceRequest;
import com.resiido.main.models.User;
import com.resiido.main.repositories.MaintenanceRepository;
import com.resiido.main.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceController {

    @Autowired
    private MaintenanceRepository maintenanceRepository;

    @Autowired
    private UserRepository userRepository;

    // 1. Create a new request
    @PostMapping
    public MaintenanceRequest createRequest(@RequestBody MaintenanceRequest request) {
        return maintenanceRepository.save(request);
    }

    // 2. Get all requests (for the Manager's view)
    @GetMapping
    public List<MaintenanceRequest> getAllRequests() {
        return maintenanceRepository.findAll();
    }

    // 3. Get requests for a specific resident
    @GetMapping("/resident/{residentId}")
    public List<MaintenanceRequest> getRequestsByResident(@PathVariable Long residentId) {
        return maintenanceRepository.findByResidentId(residentId);
    }

    // 4. Update the status of a request (Manager Action)
    @PutMapping("/{id}/status/{managerId}")
    public MaintenanceRequest updateStatus(
            @PathVariable Long id,
            @PathVariable Long managerId,
            @RequestBody String newStatus) {

        // A. Verify the User exists
        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // B. Security Check: Is this user actually a Manager?
        if (!"MANAGER".equalsIgnoreCase(manager.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: Only managers can update status.");
        }

        // C. Find the maintenance request
        MaintenanceRequest request = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Maintenance Request not found"));

        // D. Perform the update
        request.setStatus(newStatus);
        return maintenanceRepository.save(request);
    }
}