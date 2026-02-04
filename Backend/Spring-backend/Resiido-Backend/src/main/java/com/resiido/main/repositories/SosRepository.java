package com.resiido.main.repositories;

import com.resiido.main.models.SosAlert;
import com.resiido.main.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SosRepository extends JpaRepository<SosAlert, Long> {

    // Find all currently active emergencies
    List<SosAlert> findByIsActiveTrue();

    // Find history of alerts by a specific resident
    List<SosAlert> findByResident(User resident);
}