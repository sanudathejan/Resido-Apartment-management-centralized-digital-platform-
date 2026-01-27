package com.resiido.main.controllers;

import com.resiido.main.models.MaintenanceRequest;
import com.resiido.main.repositories.MaintenanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceController {

    @Autowired
    private MaintenanceRepository maintenanceRepository;

    // 1. Create a new request
    @PostMapping
    public MaintenanceRequest createRequest(@RequestBody MaintenanceRequest request) {
        return maintenanceRepository.save(request);
    }

    // 2. Get all requests (for the Manager's view)
    @GetMapping
    public List<MaintenanceRequest> getAllRequests() {
        return maintenanceRepository.findAll();
    }

    // 3. Get requests for a specific resident
    @GetMapping("/resident/{residentId}")
    public List<MaintenanceRequest> getRequestsByResident(@PathVariable Long residentId) {
        return maintenanceRepository.findByResidentId(residentId);
    }
}