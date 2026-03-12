package com.resiido.main.controllers;

import com.resiido.main.models.ParkingRequest;
import com.resiido.main.models.ParkingSlot;
import com.resiido.main.models.User;
import com.resiido.main.repositories.ParkingRequestRepository;
import com.resiido.main.repositories.ParkingSlotRepository;
import com.resiido.main.repositories.UserRepository;
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
        User requester = getAuthenticatedUser(principal);

        ParkingSlot targetSlot = slotRepository.findById(request.getSlot().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Target slot not found"));

        if (targetSlot.getOwner().getId().equals(requester.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Self-requesting is not allowed.");
        }

        request.setRequester(requester);
        request.setStatus("PENDING");
        return requestRepository.save(request);
    }

    // 4. OWNER: Approve or Deny
    @PutMapping("/request/{requestId}")
    public ParkingRequest updateRequestStatus(@PathVariable Long requestId, @RequestParam String status, Principal principal) {
        User currentUser = getAuthenticatedUser(principal);
        ParkingRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));

        if (!request.getSlot().getOwner().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not the owner of this slot.");
        }

        request.setStatus(status.toUpperCase());
        return requestRepository.save(request);
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
        if(request.getSlot().getOwner() != null) {
            isSlotOwner = request.getSlot().getOwner().getId().equals(user.getId());
        }

        if (isRequester) {
            // 1. Borrower logic: Can always cancel (even if approved)
            requestRepository.delete(request);
        } else if (isSlotOwner) {
            // 2. Lender logic: Cannot cancel once APPROVED
            if ("APPROVED".equalsIgnoreCase(request.getStatus())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot cancel a booking once you have approved it.");
            }
            requestRepository.delete(request);
        } else {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot delete this request.");
        }
    }
}