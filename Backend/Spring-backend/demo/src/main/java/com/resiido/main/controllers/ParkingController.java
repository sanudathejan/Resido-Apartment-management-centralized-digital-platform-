package com.resiido.main.controllers;

import com.resiido.main.models.ParkingRequest;
import com.resiido.main.models.ParkingSlot;
import com.resiido.main.repositories.ParkingRequestRepository;
import com.resiido.main.repositories.ParkingSlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parking")
public class ParkingController {

    @Autowired
    private ParkingSlotRepository slotRepository;

    @Autowired
    private ParkingRequestRepository requestRepository;

    // 1. Owner: Toggle availability (Lend my spot / Stop lending)
    @PutMapping("/slot/{slotId}/availability")
    public ParkingSlot toggleAvailability(@PathVariable Long slotId, @RequestParam boolean available) {
        ParkingSlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found"));
        slot.setAvailableForLending(available);
        return slotRepository.save(slot);
    }

    // 2. Borrower: See all spots currently available for lending
    @GetMapping("/available")
    public List<ParkingSlot> getAvailableSlots() {
        return slotRepository.findByIsAvailableForLendingTrue();
    }

    // 3. Borrower: Request a specific slot
    @PostMapping("/request")
    public ParkingRequest createRequest(@RequestBody ParkingRequest request) {
        return requestRepository.save(request);
    }

    // 4. Owner: See requests for their spot and Approve/Deny
    @PutMapping("/request/{requestId}")
    public ParkingRequest updateRequestStatus(@PathVariable Long requestId, @RequestParam String status) {
        ParkingRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        request.setStatus(status);
        return requestRepository.save(request);
    }

    // 5. OWNER: Check if anyone is asking for my spot
    @GetMapping("/owner/{ownerId}/pending")
    public List<ParkingRequest> getPendingRequestsForOwner(@PathVariable Long ownerId) {
        return requestRepository.findBySlotOwnerId(ownerId)
                .stream()
                .filter(r -> r.getStatus().equals("PENDING"))
                .toList();
    }

    // 6. REQUESTER: Check if my request was Approved or Denied
    @GetMapping("/requester/{requesterId}/updates")
    public List<ParkingRequest> getMyRequestUpdates(@PathVariable Long requesterId) {
        return requestRepository.findByRequesterId(requesterId);
    }
}