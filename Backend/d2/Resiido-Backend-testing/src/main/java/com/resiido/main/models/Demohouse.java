package com.resiido.main.models;

public class Demohouse // House.java
package com.resiido.main.models;

import jakarta.persistence.*;

@Entity
public class House {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String houseNumber;

    // Getters & Setters
    public Long getId() { return id; }
    public String getHouseNumber() { return houseNumber; }
    public void setHouseNumber(String houseNumber) { this.houseNumber = houseNumber; }
}{
}
