package com.resiido.main.controllers;

import com.resiido.main.models.CommonAreaBooking;
import com.resiido.main.models.User;
import com.resiido.main.repositories.CommonAreaBookingRepository;
import com.resiido.main.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/common-area")
public class CommonAreaBookingController {

    @Autowired
    private CommonAreaBookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    // HARDCODED AREAS
    private final Set<String> VALID_AREAS = Set.of("Rooftop", "Swimming Pool", "Fitness Center", "Party hall", "BBQ area");

    private User getAuthenticatedUser(Principal principal) {
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    // 1. PUBLIC CALENDAR: See approved bookings (to avoid collisions)
    // URL: GET /api/common-area/calendar?area=Rooftop
    @GetMapping("/calendar")
    public List<CommonAreaBooking> getCalendar(@RequestParam String area) {
        if (!VALID_AREAS.contains(area)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid area. Choose 'Rooftop' or 'Swimming Pool'.");
        }
        return bookingRepository.findByAreaNameAndStatus(area, "APPROVED");
    }

    // 2. RESIDENT: Request a booking
    @PostMapping("/book")
    public CommonAreaBooking createBooking(Principal principal, @RequestBody CommonAreaBooking booking) {
        User resident = getAuthenticatedUser(principal);

        // Validate Area Name
        if (!VALID_AREAS.contains(booking.getAreaName())) {
            System.out.println("Error: Invalid Area - " + booking.getAreaName());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid area. Available: " + VALID_AREAS);
        }
        System.out.println("Area Validated. Saving...");

        // Basic Time Validation
        if (booking.getEndTime().isBefore(booking.getStartTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be after start time.");
        }

        booking.setResident(resident);
        booking.setStatus("PENDING");
        return bookingRepository.save(booking);
    }

    // 3. MANAGER: View all Pending Requests
    @GetMapping("/pending")
    public List<CommonAreaBooking> getPendingRequests(Principal principal) {
        User user = getAuthenticatedUser(principal);
        if (!"MANAGER".equalsIgnoreCase(user.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only managers can view pending requests.");
        }
        return bookingRepository.findByStatus("PENDING");
    }

    // 4. MANAGER: Approve or Deny
    @PutMapping("/request/{id}")
    public CommonAreaBooking manageRequest(@PathVariable Long id, @RequestParam String status, Principal principal) {
        User manager = getAuthenticatedUser(principal);
        if (!"MANAGER".equalsIgnoreCase(manager.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only managers can manage requests.");
        }

        CommonAreaBooking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        // Validate status
        if (!status.equalsIgnoreCase("APPROVED") && !status.equalsIgnoreCase("REJECTED")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status must be APPROVED or REJECTED");
        }

        booking.setStatus(status.toUpperCase());
        return bookingRepository.save(booking);
    }

    // 5. RESIDENT: View my own booking history
    @GetMapping("/my-bookings")
    public List<CommonAreaBooking> getMyBookings(Principal principal) {
        User resident = getAuthenticatedUser(principal);
        return bookingRepository.findByResident(resident);
    }

    // 6. DELETE (Cancel) Booking
    @DeleteMapping("/{id}")
    public void deleteBooking(@PathVariable Long id, Principal principal) {
        User user = getAuthenticatedUser(principal);
        CommonAreaBooking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        // Allow if User is MANAGER OR if User is the OWNER of the booking
        boolean isOwner = booking.getResident().getId().equals(user.getId());
        boolean isManager = "MANAGER".equalsIgnoreCase(user.getRole());

        if (isManager || isOwner) {
            bookingRepository.delete(booking);
        } else {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to cancel this booking.");
        }
    }

}