package com.resiido.main.repositories;

import com.resiido.main.models.ParkingSlot;
import com.resiido.main.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, Long> {
    List<ParkingSlot> findByIsAvailableForLendingTrue();

    // Changed to return Optional<ParkingSlot> and accept a User object
    Optional<ParkingSlot> findByOwner(User owner);
}