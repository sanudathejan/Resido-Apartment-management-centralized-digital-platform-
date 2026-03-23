package com.resiido.main.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "sos_alerts")
@Data
public class SosAlert {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime timestamp;

    @ManyToOne
    @JoinColumn(name = "resident_id")
    @JsonIgnoreProperties({"password", "maintenanceRequests", "payments", "sosAlerts", "parkingRequests", "notices", "parkingSlot"})
    private User resident;

    // We can add "isActive" so managers can clear the alert later
    private boolean isActive = true;
}