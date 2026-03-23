package com.resiido.main.demo;

import java.util.*;

class User {
    private Long id;
    private String name;
    private String email;

    public User(Long id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
}

class ParkingSlot {
    private Long id;
    private String slotNumber;
    private boolean available;

    public ParkingSlot(Long id, String slotNumber) {
        this.id = id;
        this.slotNumber = slotNumber;
        this.available = true;
    }

    public Long getId() { return id; }
    public String getSlotNumber() { return slotNumber; }
    public boolean isAvailable() { return available; }

    public void setAvailable(boolean available) {
        this.available = available;
    }
}

class ParkingRequest {
    private Long id;
    private User user;
    private ParkingSlot slot;
    private String status;

    public ParkingRequest(Long id, User user, ParkingSlot slot) {
        this.id = id;
        this.user = user;
        this.slot = slot;
        this.status = "PENDING";
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public ParkingSlot getSlot() { return slot; }
    public String getStatus() { return status; }

    public void approve() {
        status = "APPROVED";
        slot.setAvailable(false);
    }

    public void reject() {
        status = "REJECTED";
    }
}

class ParkingService {

    private List<ParkingSlot> slots = new ArrayList<>();
    private List<ParkingRequest> requests = new ArrayList<>();

    public ParkingService() {
        slots.add(new ParkingSlot(1L, "A1"));
        slots.add(new ParkingSlot(2L, "A2"));
        slots.add(new ParkingSlot(3L, "B1"));
    }

    public List<ParkingSlot> getAvailableSlots() {
        List<ParkingSlot> available = new ArrayList<>();
        for (ParkingSlot slot : slots) {
            if (slot.isAvailable()) {
                available.add(slot);
            }
        }
        return available;
    }

    public ParkingRequest createRequest(User user, Long slotId) {
        ParkingSlot selected = null;

        for (ParkingSlot slot : slots) {
            if (slot.getId().equals(slotId) && slot.isAvailable()) {
                selected = slot;
                break;
            }
        }

        if (selected == null) {
            throw new RuntimeException("Slot not available");
        }

        ParkingRequest request = new ParkingRequest(
                (long) (requests.size() + 1),
                user,
                selected
        );

        requests.add(request);
        return request;
    }

    public void approveRequest(Long requestId) {
        for (ParkingRequest req : requests) {
            if (req.getId().equals(requestId)) {
                req.approve();
                return;
            }
        }
    }

    public List<ParkingRequest> getAllRequests() {
        return requests;
    }
}

public class ParkingDemoTest {

    public static void main(String[] args) {

        ParkingService service = new ParkingService();

        User user1 = new User(1L, "John", "john@example.com");
        User user2 = new User(2L, "Anna", "anna@example.com");

        System.out.println("AVAILABLE SLOTS");
        for (ParkingSlot slot : service.getAvailableSlots()) {
            System.out.println(slot.getSlotNumber());
        }

        ParkingRequest r1 = service.createRequest(user1, 1L);
        ParkingRequest r2 = service.createRequest(user2, 2L);

        service.approveRequest(r1.getId());

        System.out.println("\nREQUEST STATUS");
        for (ParkingRequest req : service.getAllRequests()) {
            System.out.println(
                    "Request ID: " + req.getId() +
                            " | User: " + req.getUser().getName() +
                            " | Slot: " + req.getSlot().getSlotNumber() +
                            " | Status: " + req.getStatus()
            );
        }

        System.out.println("\nAVAILABLE SLOTS AFTER APPROVAL");
        for (ParkingSlot slot : service.getAvailableSlots()) {
            System.out.println(slot.getSlotNumber());
        }
    }
}