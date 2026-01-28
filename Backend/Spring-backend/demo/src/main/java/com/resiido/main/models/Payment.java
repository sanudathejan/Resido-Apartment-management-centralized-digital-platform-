package com.resiido.main.models;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "payments")
@Data
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double amount;

    // Example: RENT, PARKING, LATE_FEE, UTILITY
    private String type;

    private LocalDate dueDate;

    private boolean isPaid = false;

    @ManyToOne
    @JoinColumn(name = "resident_id")
    private User resident;
}