package com.resiido.main.repositories;

import com.resiido.main.models.SosAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SosRepository extends JpaRepository<SosAlert, Long> {
    List<SosAlert> findByIsActiveTrue(); // Only show current emergencies
}