package com.resiido.main.repositories;

import com.resiido.main.models.ParkingRequest;
import com.resiido.main.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ParkingRequestRepository extends JpaRepository<ParkingRequest, Long> {
    // Finds requests based on the User object who owns the slot
    List<ParkingRequest> findBySlotOwner(User owner);

    // Filter by owner AND status (e.g., only PENDING)
    List<ParkingRequest> findBySlotOwnerAndStatus(User owner, String status);

    // Finds requests made by the specific requester object
    List<ParkingRequest> findByRequester(User requester);

    // Checks if there are any APPROVED requests for a specific slot that overlap with a given time range.
    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END FROM ParkingRequest r " +
            "WHERE r.slot.id = :slotId AND r.status = 'APPROVED' " +
            "AND r.id != :excludeRequestId " + // We use this to avoid a request conflicting with itself
            "AND r.startTime < :endTime AND r.endTime > :startTime")
    boolean existsOverlappingApprovedRequest(
            @Param("slotId") Long slotId,
            @Param("startTime") java.time.LocalDateTime startTime, // Change to java.util.Date if your model uses Date
            @Param("endTime") java.time.LocalDateTime endTime,
            @Param("excludeRequestId") Long excludeRequestId
    );
}