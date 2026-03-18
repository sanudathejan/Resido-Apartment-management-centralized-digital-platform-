package com.resiido.main.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "assistance_requests")
@Data
public class AssistanceRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime timestamp;

    @ManyToOne
    @JoinColumn(name = "resident_id")
    @JsonIgnoreProperties({"password", "maintenanceRequests", "payments", "assistanceRequests", "parkingRequests", "notices", "parkingSlot", "expoPushToken"})
    private User resident;

    private boolean isActive = true;

    public String getStatus() {
        return this.isActive ? "ACTIVE" : "RESOLVED";
    }
}