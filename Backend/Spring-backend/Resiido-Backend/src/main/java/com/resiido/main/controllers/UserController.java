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

    // 1. Upload/Update Profile Picture (Any Logged-in User)
    @PutMapping("/profile-picture")
    public void uploadProfilePicture(Principal principal, @RequestBody Map<String, String> payload) {
        User user = getAuthenticatedUser(principal);

        String base64Image = payload.get("image");
        if (base64Image == null || base64Image.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image data is missing.");
        }

        user.setProfilePicture(base64Image);
        userRepository.save(user);
    }

    // 2. Get My Profile Picture
    @GetMapping("/profile-picture")
    public Map<String, String> getMyProfilePicture(Principal principal) {
        User user = getAuthenticatedUser(principal);
        return Map.of("image", user.getProfilePicture() != null ? user.getProfilePicture() : "");
    }

    // 3. Get My Full Profile (For Frontend: Name, Role, Picture)
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
        System.out.println("--- DELETE REQUEST RECEIVED ---");
        ensureManager(principal);

        User targetUser = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User ID not found"));

        // Safety: Prevent Manager from deleting themselves here
        if (targetUser.getEmail().equals(principal.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot delete your own account via this endpoint.");
        }

        // --- SAFE UNLINK (Prevents database crashes) ---
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
}