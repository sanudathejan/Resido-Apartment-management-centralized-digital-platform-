package com.resiido.main.repositories;

import com.resiido.main.models.CommonAreaBooking;
import com.resiido.main.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommonAreaBookingRepository extends JpaRepository<CommonAreaBooking, Long> {

    // 1. Calendar: Find all APPROVED bookings for a specific area (e.g., Rooftop)
    List<CommonAreaBooking> findByAreaNameAndStatus(String areaName, String status);

    // 2. Manager: Find requests by status (e.g., PENDING)
    List<CommonAreaBooking> findByStatus(String status);

    // 3. Resident: Find my own history
    List<CommonAreaBooking> findByResident(User resident);
}
