package com.resiido.main.controllers;

import com.resiido.main.models.House;
import com.resiido.main.models.ParkingSlot;
import com.resiido.main.models.User;
import com.resiido.main.repositories.HouseRepository;
import com.resiido.main.repositories.ParkingSlotRepository;
import com.resiido.main.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.Authentication;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HouseRepository houseRepository;

    @Autowired
    private ParkingSlotRepository parkingSlotRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Autowired
    private com.resiido.main.services.EmailService emailService;

    //Get the user requesting the action
    private User getAuthenticatedUser(Principal principal) {
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    //Check if logged-in user is a Manager
    private void ensureManager(Principal principal) {
        User currentUser = getAuthenticatedUser(principal);
        if (!"MANAGER".equalsIgnoreCase(currentUser.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: Managers only.");
        }
    }

    // 1. Upload/Update/Delete Profile Picture
    @PutMapping("/profile-picture")
    public void uploadProfilePicture(Principal principal, @RequestBody Map<String, String> payload) {
        User user = getAuthenticatedUser(principal);
        String base64Image = payload.get("image");

        // If the string is empty or null, treat it as a deletion!
        if (base64Image == null || base64Image.isEmpty()) {
            user.setProfilePicture(null);
        } else {
            user.setProfilePicture(base64Image);
        }

        userRepository.save(user);
    }

    // 2. Get My Profile Picture
    @GetMapping("/profile-picture")
    public Map<String, String> getMyProfilePicture(Principal principal) {
        User user = getAuthenticatedUser(principal);
        return Map.of("image", user.getProfilePicture() != null ? user.getProfilePicture() : "");
    }

    // 3. Get My Full Profile (Useful for Frontend to load Name, Role, and Picture at once)
    @GetMapping("/me")
    public User getMyProfile(Principal principal) {
        return getAuthenticatedUser(principal);
    }

    // 4. Get All Users (Secured: Manager Only)
    @GetMapping
    public List<User> getAllUsers(Principal principal) {
        ensureManager(principal);
        return userRepository.findAll();
    }

    // 5. Delete User (Secured: Manager Only)
    @DeleteMapping("/{id}")
    @Transactional
    public void deleteUser(@PathVariable Long id, Principal principal) {
        ensureManager(principal);

        User targetUser = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User ID not found"));

        // Safety: Prevent Manager from deleting themselves here
        if (targetUser.getEmail().equals(principal.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot delete your own account via this endpoint.");
        }

        // SAFE UNLINK (Prevents database crashes)
        // If we don't do this, Postgres will block the delete because the House refers to the User
        if (targetUser.getHouse() != null) {
            House h = targetUser.getHouse();
            h.setResident(null); // Empty the house
            houseRepository.save(h);
        }
        if (targetUser.getParkingSlot() != null) {
            ParkingSlot ps = targetUser.getParkingSlot();
            ps.setOwner(null); // Empty the slot
            parkingSlotRepository.save(ps);
        }

        // Now safe to delete
        userRepository.delete(targetUser);
    }

    // 6. Update Profile Name
    @PutMapping("/name")
    public void updateProfileName(Principal principal, @RequestBody Map<String, String> payload) {
        User user = getAuthenticatedUser(principal);
        String newName = payload.get("name");

        if (newName != null && !newName.trim().isEmpty()) {
            user.setName(newName.trim());
            userRepository.save(user);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name cannot be empty");
        }
    }

    // 7. Forgot Password - Request OTP
    @PostMapping("/forgot-password")
    public void requestPasswordReset(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Generate a 6-digit OTP
        String otp = String.format("%06d", new java.util.Random().nextInt(999999));
        user.setVerificationCode(otp);
        userRepository.save(user);

        // 👇 Send the email using the service! 👇
        emailService.sendPasswordResetOtp(user.getEmail(), otp);
    }

    // 8. Forgot Password - Verify OTP & Reset
    @PostMapping("/reset-password")
    public void resetPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String otp = payload.get("otp");
        String newPassword = payload.get("newPassword");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getVerificationCode() == null || !user.getVerificationCode().equals(otp)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired OTP");
        }

        // Encrypt the password before saving it to the database!
        user.setPassword(passwordEncoder.encode(newPassword));

        // Clear the OTP so it can't be reused
        user.setVerificationCode(null);
        userRepository.save(user);
    }

    // 9. Delete Current User Account
    @DeleteMapping("/me")
    public org.springframework.http.ResponseEntity<?> deleteMyAccount(org.springframework.security.core.Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // 1. Unlink the House so the physical house isn't deleted/locked
        if (user.getHouse() != null) {
            House house = user.getHouse();
            house.setResident(null);
            houseRepository.save(house);
        }

        // 2. Unlink the Parking Slot (if you have one)
        if (user.getParkingSlot() != null) {
            ParkingSlot parkingSlot = user.getParkingSlot();
            parkingSlot.setOwner(null);
            parkingSlotRepository.save(parkingSlot);
        }

        // 3. Now it is safe to delete the user!
        userRepository.delete(user);

        return org.springframework.http.ResponseEntity.ok(java.util.Map.of("message", "Account deleted successfully"));
    }
}