package com.resiido.main.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class HouseStatusDTO {
    private Long id;
    private String houseNumber;
    private boolean isOccupied;
}