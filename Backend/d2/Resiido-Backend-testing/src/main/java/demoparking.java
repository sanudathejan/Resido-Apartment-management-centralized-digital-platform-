// ParkingSlot.java
package com.resiido.main.models;

import jakarta.persistence.*;

@Entity
public class ParkingSlot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String slotNumber;
    private boolean availableForLending;

    // Getters & Setters
    public Long getId() { return id; }
    public String getSlotNumber() { return slotNumber; }
    public void setSlotNumber(String slotNumber) { this.slotNumber = slotNumber; }
    public boolean isAvailableForLending() { return availableForLending; }
    public void setAvailableForLending(boolean availableForLending) { this.availableForLending = availableForLending; }
}