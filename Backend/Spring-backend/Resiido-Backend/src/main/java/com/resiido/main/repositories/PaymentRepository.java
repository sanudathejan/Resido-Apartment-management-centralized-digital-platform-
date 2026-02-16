package com.resiido.main.repositories;

import com.resiido.main.models.Payment;
import com.resiido.main.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // 1. Find all payments for a specific resident (History)
    List<Payment> findByResidentId(Long residentId);

    // 2. Find only unpaid bills for a resident (What they owe right now)
    List<Payment> findByResidentIdAndIsPaidFalse(Long residentId);

    // 3. Find all payments of a certain type (e.g., all "LATE_FEE" records)
    List<Payment> findByType(String type);

    // 4. Find all payments for a specific user (History)
    List<Payment> findByResident(User resident);

    // 5. Find only UNPAID bills for a specific user (To Do List)
    List<Payment> findByResidentAndIsPaidFalse(User resident);

    // 6. Find all payments waiting for manager review
    List<Payment> findByStatus(String status);
}