package com.resiido.main.repositories;

import com.resiido.main.models.ParkingSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, Long> {
    // Find slots that owners are willing to lend
    List<ParkingSlot> findByIsAvailableForLendingTrue();

    // Find the specific slot owned by a resident
    ParkingSlot findByOwnerId(Long ownerId);
}