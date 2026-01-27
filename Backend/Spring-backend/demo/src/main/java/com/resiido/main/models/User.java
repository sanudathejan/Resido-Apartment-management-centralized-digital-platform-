package com.resiido.main.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users") // This creates the "users" table in PostgreSQL
@Data // This Lombok annotation automatically generates Getters and Setters
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role; // Use "RESIDENT" or "MANAGER"
}
