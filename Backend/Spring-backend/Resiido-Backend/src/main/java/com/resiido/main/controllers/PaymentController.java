package com.resiido.main.controllers;

import com.resiido.main.models.Payment;
import com.resiido.main.models.User;
import com.resiido.main.repositories.PaymentRepository;
import com.resiido.main.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private UserRepository userRepository;

    // Helper: Get the user attempting the action
    private User getLoggedInUser(Principal principal) {
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    // 1. Create a Bill (SECURE: Only Managers can do this)
    @PostMapping
    public Payment createPayment(@RequestBody Payment payment, Principal principal) {
        User currentUser = getLoggedInUser(principal);

        // Security Check: Only Managers can issue bills
        if (!"MANAGER".equalsIgnoreCase(currentUser.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only Managers can issue new bills.");
        }

        // Note: The 'payment' JSON must include the 'resident' object or ID so we know who to bill.
        return paymentRepository.save(payment);
    }

    // 2. View My Bills (Residents see theirs, Managers see all)
    @GetMapping
    public List<Payment> getPayments(Principal principal) {
        User currentUser = getLoggedInUser(principal);

        if ("MANAGER".equalsIgnoreCase(currentUser.getRole())) {
            return paymentRepository.findAll(); // Manager sees all accounting
        } else {
            return paymentRepository.findByResident(currentUser); // Resident sees their history
        }
    }

    // 3. View only UNPAID bills (For the "Pay Now" screen)
    @GetMapping("/unpaid")
    public List<Payment> getMyUnpaidBills(Principal principal) {
        User currentUser = getLoggedInUser(principal);
        return paymentRepository.findByResidentAndIsPaidFalse(currentUser);
    }

    // 4. Pay a Bill (Secure: You can only pay YOUR own bill)
    @PutMapping("/{id}/pay")
    public Payment payBill(@PathVariable Long id, Principal principal) {
        User currentUser = getLoggedInUser(principal);

        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment record not found"));

        // Security Check: Does this bill belong to the user trying to pay it?
        // (Unless it's a manager marking it as paid manually)
        if (!payment.getResident().getId().equals(currentUser.getId()) && !"MANAGER".equalsIgnoreCase(currentUser.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot pay someone else's bill.");
        }

        if (payment.isPaid()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This bill is already paid.");
        }

        payment.setPaid(true);
        return paymentRepository.save(payment);
    }
}