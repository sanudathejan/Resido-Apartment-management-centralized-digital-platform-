package com.resiido.main.controllers;

import com.resiido.main.models.User;
import com.resiido.main.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users") // This sets the URL to http://localhost:8080/api/users
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // This handles GET requests (asking for data)
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // This handles POST requests (sending new data to save)
    @PostMapping
    public User createUser(@RequestBody User user) {
        return userRepository.save(user);
    }
}