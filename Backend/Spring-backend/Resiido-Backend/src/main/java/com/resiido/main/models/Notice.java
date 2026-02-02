package com.resiido.main.models;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "notices")
@Data
public class Notice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT") // Allows for long messages
    private String content;

    private LocalDateTime postedAt;

    @ManyToOne
    @JoinColumn(name = "author_id")
    private User author; // The manager who wrote it
}