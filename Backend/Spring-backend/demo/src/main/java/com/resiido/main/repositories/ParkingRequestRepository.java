package com.resiido.main.repositories;

import com.resiido.main.models.ParkingRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ParkingRequestRepository extends JpaRepository<ParkingRequest, Long> {
    // For the Owner: See requests for their slot
    List<ParkingRequest> findBySlotOwnerId(Long ownerId);

    // For the Requester: See status of their requests
    List<ParkingRequest> findByRequesterId(Long requesterId);
}