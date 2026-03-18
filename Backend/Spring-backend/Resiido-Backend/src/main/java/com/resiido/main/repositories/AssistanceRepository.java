package com.resiido.main.repositories;

import com.resiido.main.models.AssistanceRequest;
import com.resiido.main.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AssistanceRepository extends JpaRepository<AssistanceRequest, Long> {
    List<AssistanceRequest> findByIsActiveTrue();
    List<AssistanceRequest> findByResident(User resident);
}