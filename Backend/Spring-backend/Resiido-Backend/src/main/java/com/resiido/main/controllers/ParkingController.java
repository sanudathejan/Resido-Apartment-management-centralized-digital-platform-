package com.resiido.main.controllers;

import com.resiido.main.models.ParkingRequest;
import com.resiido.main.models.ParkingSlot;
import com.resiido.main.models.User;
import com.resiido.main.repositories.ParkingRequestRepository;
import com.resiido.main.repositories.ParkingSlotRepository;
import com.resiido.main.repositories.UserRepository;
import com.resiido.main.services.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/parking")
public class ParkingController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private ParkingSlotRepository slotRepository;

    @Autowired
    private ParkingRequestRepository requestRepository;

    @Autowired
    private UserRepository userRepository;

    // Gets User from the JWT Principal
    private User getAuthenticatedUser(Principal principal) {
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    // 1. OWNER: Toggle availability
    @PutMapping("/my-slot/availability")
    public ParkingSlot toggleAvailability(Principal principal, @RequestParam boolean available) {
        User currentUser = getAuthenticatedUser(principal);

        ParkingSlot slot = slotRepository.findByOwner(currentUser)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No assigned slot found."));

        slot.setAvailableForLending(available);
        return slotRepository.save(slot);
    }

    // 2. BORROWER: See what's available
    @GetMapping("/available")
    public List<ParkingSlot> getAvailableSlots() {
        return slotRepository.findByIsAvailableForLendingTrue();
    }

    // 3. BORROWER: Request a spot
    @PostMapping("/request")
    public ParkingRequest createRequest(Principal principal, @RequestBody ParkingRequest request) {
        System.out.println("PARKING REQUEST ENDPOINT HIT");

        if (principal == null) {
            System.out.println("PRINCIPAL IS NULL");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }

        System.out.println("PRINCIPAL: " + principal.getName());

        User requester = getAuthenticatedUser(principal);

        ParkingSlot targetSlot = slotRepository.findById(request.getSlot().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Target slot not found"));

        System.out.println("TARGET SLOT ID: " + targetSlot.getId());

        if (targetSlot.getOwner() == null) {
            System.out.println("TARGET SLOT OWNER IS NULL");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Parking slot has no owner assigned");
        }

        System.out.println("TARGET SLOT OWNER ID: " + targetSlot.getOwner().getId());
        System.out.println("REQUESTER ID: " + requester.getId());

        if (targetSlot.getOwner().getId().equals(requester.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Self-requesting is not allowed.");
        }

        boolean isOverlapping = requestRepository.existsOverlappingApprovedRequest(
                targetSlot.getId(), request.getStartTime(), request.getEndTime(), -1L);

        if (isOverlapping) {
            // 409 CONFLICT is the standard HTTP status for this situation
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This parking slot is already booked for the selected time.");
        }

        request.setRequester(requester);
        request.setStatus("PENDING");
        request.setSlot(targetSlot);

        ParkingRequest savedRequest = requestRepository.save(request);
        System.out.println("PARKING REQUEST SAVED WITH ID: " + savedRequest.getId());

        return savedRequest;
    }


    // 4. OWNER: Approve or Deny
    @PutMapping("/request/{requestId}")
    public ParkingRequest updateRequestStatus(@PathVariable Long requestId,
                                              @RequestParam String status,
                                              Principal principal) {
        User currentUser = getAuthenticatedUser(principal);

        ParkingRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));

        if (!request.getSlot().getOwner().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not the owner of this slot.");
        }

        if ("APPROVED".equalsIgnoreCase(status)) {
            boolean isOverlapping = requestRepository.existsOverlappingApprovedRequest(
                    request.getSlot().getId(), request.getStartTime(), request.getEndTime(), request.getId());

            if (isOverlapping) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already approved another user for this exact time frame.");
            }
        }

        request.setStatus(status.toUpperCase());
        ParkingRequest updatedRequest = requestRepository.save(request);

        if ("APPROVED".equalsIgnoreCase(status)) {
            notificationService.createNotification(
                    request.getRequester(),
                    "Parking Request Approved",
                    "Your parking request has been approved successfully."
            );
        }

        return updatedRequest;
    }

    // 5. OWNER: Check my pending requests
    @GetMapping("/my-slot/pending")
    public List<ParkingRequest> getMyPendingRequests(Principal principal) {
        User currentUser = getAuthenticatedUser(principal);
        return requestRepository.findBySlotOwnerAndStatus(currentUser, "PENDING");
    }

    // 6. REQUESTER: Check my outgoing requests
    @GetMapping("/my-requests")
    public List<ParkingRequest> getMyRequests(Principal principal) {
        User currentUser = getAuthenticatedUser(principal);
        return requestRepository.findByRequester(currentUser);
    }

    // 7. DELETE REQUEST (Cancel/Reject)
    @DeleteMapping("/request/{id}")
    public void deleteRequest(@PathVariable Long id, Principal principal) {
        User user = getAuthenticatedUser(principal);

        ParkingRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));

        boolean isRequester = request.getRequester().getId().equals(user.getId());

        boolean isSlotOwner = false;
        if (request.getSlot().getOwner() != null) {
            isSlotOwner = request.getSlot().getOwner().getId().equals(user.getId());
        }

        if (isRequester) {
            // Borrower can cancel own request
            requestRepository.delete(request);
        } else if (isSlotOwner) {
            // Owner cannot cancel after approval
            if ("APPROVED".equalsIgnoreCase(request.getStatus())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "You cannot cancel a booking once you have approved it.");
            }
            requestRepository.delete(request);
        } else {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot delete this request.");
        }
    }
    // 8. OWNER: Get my parking slot details
    @GetMapping("/my-slot")
    public ParkingSlot getMySlot(Principal principal) {
        User currentUser = getAuthenticatedUser(principal);
        return slotRepository.findByOwner(currentUser)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No assigned slot found."));
    }

    // 9. OWNER: Check my approved requests (who is currently scheduled to use my slot)
    @GetMapping("/my-slot/approved")
    public List<ParkingRequest> getMyApprovedRequests(Principal principal) {
        User currentUser = getAuthenticatedUser(principal);
        return requestRepository.findBySlotOwnerAndStatus(currentUser, "APPROVED");
    }
}