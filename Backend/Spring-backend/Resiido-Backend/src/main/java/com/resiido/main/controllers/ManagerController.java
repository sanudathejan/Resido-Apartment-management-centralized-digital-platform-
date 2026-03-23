package com.resiido.main.controllers;

import com.resiido.main.dtos.ResidentSummaryDTO;
import com.resiido.main.models.User;
import com.resiido.main.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/manager")
public class ManagerController {

    @Autowired
    private UserRepository userRepository;

    // Helper: Ensure the requester is a Manager
    private void validateManager(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (!"MANAGER".equalsIgnoreCase(user.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: Managers only.");
        }
    }

    // GET /api/manager/residents
    @GetMapping("/residents")
    public List<ResidentSummaryDTO> getAllResidentsSummary(Principal principal) {
        // 1. Security Check
        validateManager(principal);

        // 2. Fetch all users with role 'RESIDENT'
        List<User> residents = userRepository.findAll().stream()
                .filter(u -> "RESIDENT".equalsIgnoreCase(u.getRole()))
                .collect(Collectors.toList());

        // 3. Convert User entities to DTOs
        return residents.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // Mapper function
    private ResidentSummaryDTO convertToDTO(User user) {
        ResidentSummaryDTO dto = new ResidentSummaryDTO();
        dto.setUserId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());

        // Safe extraction of House Number
        if (user.getHouse() != null) {
            dto.setHouseNumber(user.getHouse().getHouseNumber());
        } else {
            dto.setHouseNumber("Unassigned");
        }

        // Safe extraction of Parking Slot
        if (user.getParkingSlot() != null) {
            dto.setParkingSlot(user.getParkingSlot().getSlotNumber());
        } else {
            dto.setParkingSlot("None");
        }

        //Calculate Counts
        if (user.getMaintenanceRequests() != null) {
            long activeMaint = user.getMaintenanceRequests().stream()
                    .filter(req -> !"COMPLETED".equalsIgnoreCase(req.getStatus()) && !"REJECTED".equalsIgnoreCase(req.getStatus()))
                    .count();
            dto.setActiveMaintenanceRequests((int) activeMaint);
        }

        // 2. Pending Parking Requests (Outgoing)
        if (user.getParkingRequests() != null) {
            long pendingParking = user.getParkingRequests().stream()
                    .filter(req -> "PENDING".equalsIgnoreCase(req.getStatus()))
                    .count();
            dto.setPendingParkingRequests((int) pendingParking);
        }

        // 3. Total SOS Alerts (History)
        if (user.getSosAlerts() != null) {
            dto.setTotalSosAlerts(user.getSosAlerts().size());
        }

        // 4. Active Common Area Bookings
        if (user.getCommonAreaBookings() != null) {
            long activeBookings = user.getCommonAreaBookings().stream()
                    .filter(b -> "APPROVED".equalsIgnoreCase(b.getStatus()) || "PENDING".equalsIgnoreCase(b.getStatus()))
                    .count();
            dto.setActiveCommonAreaBookings((int) activeBookings);
        }

        return dto;
    }
}