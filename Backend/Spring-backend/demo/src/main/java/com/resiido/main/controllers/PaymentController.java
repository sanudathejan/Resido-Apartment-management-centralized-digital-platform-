package com.resiido.main.controllers;

import com.resiido.main.models.Payment;
import com.resiido.main.repositories.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentRepository paymentRepository;

    // 1. Manager creates a new bill (Rent, Late Fee, etc.)
    @PostMapping
    public Payment createPayment(@RequestBody Payment payment) {
        return paymentRepository.save(payment);
    }

    // 2. Resident views their specific unpaid bills
    @GetMapping("/resident/{residentId}/unpaid")
    public List<Payment> getUnpaidPayments(@PathVariable Long residentId) {
        return paymentRepository.findByResidentIdAndIsPaidFalse(residentId);
    }

    // 3. Resident "Pays" the bill (Updates isPaid to true)
    @PutMapping("/{id}/pay")
    public Payment payBill(@PathVariable Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment record not found"));
        payment.setPaid(true);
        return paymentRepository.save(payment);
    }
}