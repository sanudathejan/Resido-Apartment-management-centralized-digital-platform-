package com.resiido.main.controllers;

import com.resiido.main.models.MaintenanceRequest;
import com.resiido.main.models.User;
import com.resiido.main.repositories.MaintenanceRepository;
import com.resiido.main.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceController {

    @Autowired
    private MaintenanceRepository maintenanceRepository;

    @Autowired
    private UserRepository userRepository;

    // Helper method to get the currently logged-in User
    private User getLoggedInUser(Principal principal) {
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    // 1. Create a new request (Auto-links to the logged-in user)
    @PostMapping
    public MaintenanceRequest createRequest(@RequestBody MaintenanceRequest request, Principal principal) {
        User currentUser = getLoggedInUser(principal);

        // Force the resident to be the logged-in user
        request.setResident(currentUser);
        request.setStatus("PENDING"); // Force status to start as PENDING

        return maintenanceRepository.save(request);
    }

    // 2. "Get All" (Manager sees ALL, Resident sees THEIRS)
    @GetMapping
    public List<MaintenanceRequest> getAllRequests(Principal principal) {
        User currentUser = getLoggedInUser(principal);

        if ("MANAGER".equalsIgnoreCase(currentUser.getRole())) {
            // Manager: Returns everyone's requests
            return maintenanceRepository.findAll();
        } else {
            // Resident: Returns only THEIR requests
            return maintenanceRepository.findByResident(currentUser);
        }
    }

    // 3. Update Status (Manager Only - Secured by Token)
    @PutMapping("/{id}/status")
    public MaintenanceRequest updateStatus(
            @PathVariable Long id,
            @RequestBody String newStatus,
            Principal principal) {

        User currentUser = getLoggedInUser(principal);

        // A. Security Check: Is this user actually a Manager?
        if (!"MANAGER".equalsIgnoreCase(currentUser.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: Only managers can update status.");
        }

        // B. Find the maintenance request
        MaintenanceRequest request = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Maintenance Request not found"));

        // C. Perform the update
        request.setStatus(newStatus);
        return maintenanceRepository.save(request);
    }

    // 4. DELETE (Cancel) Request
    @DeleteMapping("/{id}")
    public void deleteRequest(@PathVariable Long id, Principal principal) {
        User user = getLoggedInUser(principal);
        MaintenanceRequest request = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));

        // Allow if User is MANAGER OR if User is the OWNER of the request
        boolean isOwner = request.getResident().getId().equals(user.getId());
        boolean isManager = "MANAGER".equalsIgnoreCase(user.getRole());

        if (isManager || isOwner) {
            maintenanceRepository.delete(request);
        } else {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to delete this request.");
        }
    }
}