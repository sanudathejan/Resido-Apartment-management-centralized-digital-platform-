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
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private UserRepository userRepository;

    private User getLoggedInUser(Principal principal) {
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    // 1. Create a Bill (Manager Only)
    @PostMapping
    public Payment createPayment(@RequestBody Payment payment, Principal principal) {
        User currentUser = getLoggedInUser(principal);
        if (!"MANAGER".equalsIgnoreCase(currentUser.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only Managers can issue bills.");
        }
        payment.setStatus("PENDING");
        payment.setPaid(false);
        return paymentRepository.save(payment);
    }

    // 2. View My Bills
    @GetMapping
    public List<Payment> getPayments(Principal principal) {
        User currentUser = getLoggedInUser(principal);
        if ("MANAGER".equalsIgnoreCase(currentUser.getRole())) {
            return paymentRepository.findAll(); // Manager sees all accounting
        } else {
            return paymentRepository.findByResident(currentUser); // Resident sees their history
        }
    }

    // 3. Resident Submits Proof (Upload Receipt)
    @PutMapping("/{id}/submit-proof")
    public Payment submitProof(@PathVariable Long id, @RequestBody Map<String, String> payload, Principal principal) {
        User currentUser = getLoggedInUser(principal);
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bill not found"));

        if (!payment.getResident().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot pay someone else's bill.");
        }

        String image = payload.get("receiptImage");
        if (image == null || image.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Receipt image is required.");
        }

        payment.setReceiptImage(image);
        payment.setStatus("REVIEW"); // Moves to Manager's queue
        return paymentRepository.save(payment);
    }

    // 4. Manager Approves/Rejects Payment
    @PutMapping("/{id}/verify")
    public Payment verifyPayment(@PathVariable Long id, @RequestParam boolean approved, Principal principal) {
        User currentUser = getLoggedInUser(principal);
        if (!"MANAGER".equalsIgnoreCase(currentUser.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only Managers can verify payments.");
        }

        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bill not found"));

        if (approved) {
            payment.setStatus("PAID");
            payment.setPaid(true); // Now it is officially paid
        } else {
            payment.setStatus("REJECTED");
            payment.setPaid(false);
            // Optional: You could clear the receipt image here so they have to upload a new one
            payment.setReceiptImage(null);
        }

        return paymentRepository.save(payment);
    }

    // 5. Manager: Get all payments waiting for approval (Status = "REVIEW")
    @GetMapping("/pending-review")
    public List<Payment> getPendingReviews(Principal principal) {
        User currentUser = getLoggedInUser(principal);

        // Security Check: Only Managers can see the review queue
        if (!"MANAGER".equalsIgnoreCase(currentUser.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: Managers only.");
        }

        // Returns only the payments where residents have uploaded proof
        return paymentRepository.findByStatus("REVIEW");
    }

    // 6. Get My Unpaid Bills (For "Pay Now" screen)
    @GetMapping("/unpaid")
    public List<Payment> getMyUnpaidBills(Principal principal) {
        User currentUser = getLoggedInUser(principal);
        return paymentRepository.findByResidentAndIsPaidFalse(currentUser);
    }
}