package com.resiido.main.repositories;

import com.resiido.main.models.ParkingRequest;
import com.resiido.main.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ParkingRequestRepository extends JpaRepository<ParkingRequest, Long> {
    // Finds requests based on the User object who owns the slot
    List<ParkingRequest> findBySlotOwner(User owner);

    // Filter by owner AND status (e.g., only PENDING)
    List<ParkingRequest> findBySlotOwnerAndStatus(User owner, String status);

    // Finds requests made by the specific requester object
    List<ParkingRequest> findByRequester(User requester);
}