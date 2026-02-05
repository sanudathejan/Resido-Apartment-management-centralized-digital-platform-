package com.resiido.main.models;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "houses")
@Data
public class House {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String houseNumber; // e.g., "G-01", "10-07"

    // One House has One Active Resident Owner
    @OneToOne
    @JoinColumn(name = "resident_id")
    @JsonIgnore
    private User resident;
}