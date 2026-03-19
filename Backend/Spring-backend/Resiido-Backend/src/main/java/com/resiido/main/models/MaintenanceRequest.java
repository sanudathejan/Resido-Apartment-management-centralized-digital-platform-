package com.resiido.main.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "maintenance_requests")
@Data // Generates getters, setters, toString, equals, and hashCode
@NoArgsConstructor // Required by JPA
@AllArgsConstructor // Useful for manual object creation
public class MaintenanceRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String status = "PENDING"; // Default status

    @Column(columnDefinition = "TEXT")
    private String imageBase64;

    // This creates a "resident_id" column in your SQL table
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "resident_id", nullable = false)
    private User resident;
}