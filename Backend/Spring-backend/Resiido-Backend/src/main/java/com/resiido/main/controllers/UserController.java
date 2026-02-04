package com.resiido.main.controllers;

import com.resiido.main.models.User;
import com.resiido.main.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // Check if logged-in user is a Manager
    private void ensureManager(Principal principal) {
        User currentUser = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (!"MANAGER".equalsIgnoreCase(currentUser.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: Managers only.");
        }
    }

    // 1. Get All Users (Secured: Manager Only)
    @GetMapping
    public List<User> getAllUsers(Principal principal) {
        ensureManager(principal);
        return userRepository.findAll();
    }

    // 2. Delete User (Secured: Manager Only)
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id, Principal principal) {
        System.out.println("--- DELETE REQUEST RECEIVED ---");
        System.out.println("User attempting delete: " + principal.getName());

        ensureManager(principal);

        System.out.println("--- MANAGER CHECK PASSED ---");

        if (!userRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User ID not found");
        }

        // Safety: Prevent Manager from deleting their own account while logged in
        User currentUser = userRepository.findByEmail(principal.getName()).get();
        if (currentUser.getId().equals(id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot delete your own account while logged in.");
        }

        try {
            userRepository.deleteById(id);
        } catch (Exception e) {
            // This catches the Foreign Key error if the user has payments/requests
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot delete user: They have related data (Maintenance/Payments). Delete those records first.");
        }
    }
}