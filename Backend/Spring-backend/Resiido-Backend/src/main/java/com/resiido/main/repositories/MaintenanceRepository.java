package com.resiido.main.repositories;

import com.resiido.main.models.MaintenanceRequest;
import com.resiido.main.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MaintenanceRepository extends JpaRepository<MaintenanceRequest, Long> {
    // This allows us to pass a User object and get their specific requests
    List<MaintenanceRequest> findByResident(User resident);

    // This allows us to find all complaints belonging to one specific person
    List<MaintenanceRequest> findByResidentId(Long residentId);
}