package com.resiido.main.controllers;

import com.resiido.main.models.Payment;
import com.resiido.main.repositories.PaymentRepository;
import com.resiido.main.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private UserRepository userRepository;

    // 1. Manager creates a new bill (Rent, Late Fee, etc.)
    @PostMapping
    public Payment createPayment(@RequestBody Payment payment) {
        return paymentRepository.save(payment);
    }

    // 2. Resident views their specific unpaid bills
    @GetMapping("/resident/{residentId}/unpaid")
    public List<Payment> getUnpaidPayments(@PathVariable Long residentId) {
        if (!userRepository.existsById(residentId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Resident not found");
        }
        return paymentRepository.findByResidentIdAndIsPaidFalse(residentId);
    }

    // 3. Resident "Pays" the bill (Updates isPaid to true)
    @PutMapping("/{id}/pay")
    public Payment payBill(@PathVariable Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment record not found"));
        if (payment.isPaid()) {
            // This will show as 400 Bad Request
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This bill has already been settled.");
        }
        payment.setPaid(true);
        return paymentRepository.save(payment);
    }
}