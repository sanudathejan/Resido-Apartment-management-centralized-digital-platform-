package com.resiido.main.models;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;

@Entity
@Table(name = "users") // This creates the "users" table in PostgreSQL
@Data // This Lombok annotation automatically generates Getters and Setters
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role; // Use "RESIDENT" or "MANAGER"

    // 1. If User is deleted, delete their Maintenance Requests
    @OneToMany(mappedBy = "resident", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore // Prevent infinite loop in JSON
    private List<MaintenanceRequest> maintenanceRequests;

    // 2. If User is deleted, delete their Payments
    @OneToMany(mappedBy = "resident", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Payment> payments;

    // 3. If User is deleted, delete their SOS Alerts
    @OneToMany(mappedBy = "resident", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<SosAlert> sosAlerts;

    // 4. If User is deleted, delete their Parking Requests
    @OneToMany(mappedBy = "requester", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<ParkingRequest> parkingRequests;

    // 5. If User (Manager) is deleted, delete the Notices they posted
    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Notice> notices;

    // 6. If User is deleted, DELETE their single Parking Slot
    @OneToOne(mappedBy = "owner", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private ParkingSlot parkingSlot;

    // 7. If User is deleted, delete their Common Area Bookings
    @OneToMany(mappedBy = "resident", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<CommonAreaBooking> commonAreaBookings;
}
