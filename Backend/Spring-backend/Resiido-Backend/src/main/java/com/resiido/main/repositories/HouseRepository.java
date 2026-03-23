package com.resiido.main.repositories;

import com.resiido.main.models.House;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface HouseRepository extends JpaRepository<House, Long> {
    Optional<House> findByHouseNumber(String houseNumber);
}