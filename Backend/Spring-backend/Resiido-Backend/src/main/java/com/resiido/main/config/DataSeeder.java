package com.resiido.main.config;

import com.resiido.main.models.House;
import com.resiido.main.models.ParkingSlot;
import com.resiido.main.models.User;
import com.resiido.main.repositories.HouseRepository;
import com.resiido.main.repositories.ParkingSlotRepository;
import com.resiido.main.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository,
                                   HouseRepository houseRepository,
                                   ParkingSlotRepository parkingSlotRepository,
                                   PasswordEncoder passwordEncoder) {
        return args -> {
            // 1. Create Admin0
            if (userRepository.findByEmail("exampleresidence1@gmail.com").isEmpty()) {
                User admin0 = new User();
                admin0.setName("admin0");
                admin0.setEmail("exampleresidence1@gmail.com");
                admin0.setPassword(passwordEncoder.encode("exampleadmin0"));
                admin0.setRole("MANAGER");
                admin0.setVerified(true);
                userRepository.save(admin0);
                System.out.println("✅ admin0 created.");
            }

            // 2. Generate 77 Houses & Parking Slots (If they don't exist)
            if (houseRepository.count() == 0) {
                System.out.println("Generating Layout (Houses & Parking)...");

                // Floors: 0=Ground, 1-10
                for (int floor = 0; floor <= 10; floor++) {
                    // Units: 1-7
                    for (int unit = 1; unit <= 7; unit++) {

                        // Format: "G-01" or "10-07"
                        String floorStr = (floor == 0) ? "G" : String.valueOf(floor);
                        String houseNum = String.format("%s-%02d", floorStr, unit);

                        // Create House
                        House house = new House();
                        house.setHouseNumber(houseNum);
                        houseRepository.save(house);

                        // Create Matching Parking Slot (e.g., "P-G-01")
                        ParkingSlot slot = new ParkingSlot();
                        slot.setSlotNumber("P-" + houseNum);
                        slot.setAvailableForLending(false);
                        parkingSlotRepository.save(slot);
                    }
                }
                System.out.println("✅ 77 Houses and Parking Slots created.");
            }
        };
    }
}