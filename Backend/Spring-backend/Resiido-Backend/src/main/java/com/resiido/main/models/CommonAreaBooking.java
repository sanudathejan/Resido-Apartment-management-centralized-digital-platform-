package com.resiido.main.models;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "common_area_bookings")
@Data
public class CommonAreaBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Hardcoded validation happens in the Controller
    @Column(nullable = false)
    private String areaName; // "Rooftop" or "Swimming Pool"

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    // PENDING, APPROVED, REJECTED
    private String status = "PENDING";

    @ManyToOne
    @JoinColumn(name = "resident_id")
    private User resident;
}