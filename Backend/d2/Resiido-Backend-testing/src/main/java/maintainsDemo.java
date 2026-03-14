package com.resiido.main.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Maintenance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 1000)
    private String description;

    private String status; // e.g., PENDING, IN_PROGRESS, COMPLETED

    private LocalDateTime createdAt;

    public Maintenance() {
        this.createdAt = LocalDateTime.now();
        this.status = "PENDING";
    }

    // Getters & Setters
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}