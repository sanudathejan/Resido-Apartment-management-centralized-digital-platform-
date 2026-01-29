package com.resiido.main.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "parking_slots")
@Data
public class ParkingSlot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String slotNumber;

    // Is the owner currently willing to lend this out?
    private boolean isAvailableForLending = false;

    @OneToOne // Each resident usually has exactly one permanent slot
    @JoinColumn(name = "owner_id")
    private User owner;
}