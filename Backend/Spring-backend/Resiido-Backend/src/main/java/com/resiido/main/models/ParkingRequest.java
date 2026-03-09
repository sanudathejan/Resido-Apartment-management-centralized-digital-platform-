package com.resiido.main.models;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "parking_requests")
@Data
public class ParkingRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    // Status: PENDING, APPROVED, REJECTED, COMPLETED
    private String status = "PENDING";

    @ManyToOne
    @JoinColumn(name = "requester_id")
    private User requester; // The person who has a visitor

    @ManyToOne
    @JoinColumn(name = "slot_id")
    private ParkingSlot slot;

    @Column(nullable = false, length = 20)
    private String visitorVehicleNumber;
}