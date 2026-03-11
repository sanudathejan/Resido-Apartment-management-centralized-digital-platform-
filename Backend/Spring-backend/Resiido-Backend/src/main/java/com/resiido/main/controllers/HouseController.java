package com.resiido.main.controllers;

import com.resiido.main.dtos.HouseStatusDTO;
import com.resiido.main.models.House;
import com.resiido.main.repositories.HouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/houses")
public class HouseController {

    @Autowired
    private HouseRepository houseRepository;

    // PUBLIC ENDPOINT: Get all houses and their availability status
    @GetMapping("/status")
    public List<HouseStatusDTO> getAllHouseStatuses() {
        List<House> houses = houseRepository.findAll();

        return houses.stream()
                .map(house -> new HouseStatusDTO(
                        house.getId(),
                        house.getHouseNumber(),
                        house.getResident() != null // true if someone lives there, false if it's null
                ))
                .collect(Collectors.toList());
    }
}