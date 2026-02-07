package com.resiido.main.models;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;

@Entity
@Table(name = "users")
@Data
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
    private String role;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String profilePicture;

    @Column(name = "is_verified", nullable = false)
    private boolean isVerified = false;

    @JsonIgnore
    @Column(name = "verification_code")
    private String verificationCode;

    // Stores "1-05" temporarily until approved
    @Column(name = "requested_house_number")
    private String requestedHouseNumber;

    // Changed ALL to PERSIST, MERGE. Deleting User will NOT delete House.
    @OneToOne(mappedBy = "resident", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JsonIgnore
    private House house;

    @OneToOne(mappedBy = "owner", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JsonIgnore
    private ParkingSlot parkingSlot;

    @OneToMany(mappedBy = "resident", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<MaintenanceRequest> maintenanceRequests;

    @OneToMany(mappedBy = "resident", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Payment> payments;

    @OneToMany(mappedBy = "resident", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<SosAlert> sosAlerts;

    @OneToMany(mappedBy = "requester", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<ParkingRequest> parkingRequests;

    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Notice> notices;

    @OneToMany(mappedBy = "resident", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<CommonAreaBooking> commonAreaBookings;
}