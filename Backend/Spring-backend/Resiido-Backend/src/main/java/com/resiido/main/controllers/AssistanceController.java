package com.resiido.main.controllers;

import com.resiido.main.models.AssistanceRequest;
import com.resiido.main.models.User;
import com.resiido.main.repositories.AssistanceRepository;
import com.resiido.main.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/assistance")
public class AssistanceController {

    @Autowired
    private AssistanceRepository assistanceRepository;

    @Autowired
    private UserRepository userRepository;

    // Helper: Get logged-in user
    private User getLoggedInUser(Principal principal) {
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    // 1. Trigger Assistance Request
    @PostMapping
    public AssistanceRequest triggerAssistance(Principal principal) {
        User currentUser = getLoggedInUser(principal);

        AssistanceRequest request = new AssistanceRequest();
        request.setResident(currentUser);
        request.setTimestamp(LocalDateTime.now());
        request.setActive(true);

        return assistanceRepository.save(request);
    }

    // View ALL Requests (Active & Resolved) - Managers Only
    @GetMapping
    public List<AssistanceRequest> getAllRequests(Principal principal) {
        User currentUser = getLoggedInUser(principal);

        // Security check: Only allow Manager/Admin to pull the full log
        if (!"MANAGER".equalsIgnoreCase(currentUser.getRole()) && !"ADMIN".equalsIgnoreCase(currentUser.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only managers can view the full history.");
        }
        return assistanceRepository.findAll();
    }

    // 2. View Active Requests (Managers see all, Residents see their floor)
    @GetMapping("/active")
    public List<AssistanceRequest> getActiveRequests(Principal principal) {
        User currentUser = getLoggedInUser(principal);
        List<AssistanceRequest> allActive = assistanceRepository.findByIsActiveTrue();

        if ("MANAGER".equalsIgnoreCase(currentUser.getRole())) {
            return allActive;
        }

        // For residents, only show active requests from their floor
        String myHouse = currentUser.getRequestedHouseNumber();
        if (myHouse == null) return List.of();
        String myFloor = myHouse.split("-")[0];

        return allActive.stream()
                .filter(req -> {
                    String reqHouse = req.getResident().getRequestedHouseNumber();
                    return reqHouse != null && reqHouse.startsWith(myFloor + "-");
                })
                .collect(Collectors.toList());
    }

    // 3. SILENT CHECK FOR LOGIN POPUP (Returns true/false)
    @GetMapping("/check-pending")
    public ResponseEntity<?> checkPendingAssistance(Principal principal) {
        User currentUser = getLoggedInUser(principal);
        List<AssistanceRequest> activeRequests = assistanceRepository.findByIsActiveTrue();

        boolean hasPending = false;

        if ("MANAGER".equalsIgnoreCase(currentUser.getRole())) {
            hasPending = !activeRequests.isEmpty();
        } else {
            // Resident check: Is there someone on my floor who needs help (excluding myself)?
            String myHouse = currentUser.getRequestedHouseNumber();
            if (myHouse != null) {
                String myFloor = myHouse.split("-")[0];
                hasPending = activeRequests.stream().anyMatch(req -> {
                    User requester = req.getResident();
                    if (requester.getId().equals(currentUser.getId())) return false; // Ignore my own requests
                    String reqHouse = requester.getRequestedHouseNumber();
                    return reqHouse != null && reqHouse.startsWith(myFloor + "-");
                });
            }
        }

        return ResponseEntity.ok(Map.of("hasPending", hasPending));
    }

    // 4. Resolve/Clear Request
    @PutMapping("/{id}/resolve")
    public AssistanceRequest resolveAssistance(@PathVariable Long id, Principal principal) {
        User currentUser = getLoggedInUser(principal);

        AssistanceRequest request = assistanceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));

        boolean isManager = "MANAGER".equalsIgnoreCase(currentUser.getRole());
        boolean isOwner = request.getResident().getId().equals(currentUser.getId());

        if (!isManager && !isOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot resolve this request.");
        }

        request.setActive(false);
        return assistanceRepository.save(request);
    }

    // 5. Resident: View my own history
    @GetMapping("/my-history")
    public List<AssistanceRequest> getMyHistory(Principal principal) {
        User currentUser = getLoggedInUser(principal);
        return assistanceRepository.findByResident(currentUser);
    }
}