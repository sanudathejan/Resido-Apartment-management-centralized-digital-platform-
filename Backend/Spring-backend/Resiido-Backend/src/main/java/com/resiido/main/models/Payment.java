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

    // The proof of payment (Base64 image)
    @Column(columnDefinition = "TEXT")
    private String receiptImage;

    // PENDING, REVIEW, PAID, REJECTED
    private String status = "PENDING";

    private boolean isPaid = false;

    @ManyToOne
    @JoinColumn(name = "resident_id")
    private User resident;
}