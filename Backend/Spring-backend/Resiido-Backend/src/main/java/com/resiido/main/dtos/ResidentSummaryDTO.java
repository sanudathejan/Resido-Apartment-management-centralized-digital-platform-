package com.resiido.main.dtos;

import lombok.Data;

@Data
public class ResidentSummaryDTO {
    private Long userId;
    private String name;
    private String email;
    private String houseNumber;
    private String parkingSlot;

    // Activity Counters (Quick stats for the manager)
    private int activeMaintenanceRequests;
    private int pendingParkingRequests;
    private int totalSosAlerts;
    private int activeCommonAreaBookings;
}