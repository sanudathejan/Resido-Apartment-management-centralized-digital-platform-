package com.resiido.main.dtos;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ParkingRequestCreateDTO {
    private Long slotId;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private String visitorVehicleNumber;
}

