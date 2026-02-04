package com.resiido.main.controllers;

import com.resiido.main.models.Notice;
import com.resiido.main.models.User;
import com.resiido.main.repositories.NoticeRepository;
import com.resiido.main.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/notices")
public class NoticeController {

    @Autowired
    private NoticeRepository noticeRepository;

    @Autowired
    private UserRepository userRepository;

    // Helper: Verify Manager Role
    private User getAuthenticatedManager(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (!"MANAGER".equalsIgnoreCase(user.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only managers can perform this action.");
        }
        return user;
    }

    // 1. Post a notice (MANAGER ONLY) - URL: POST /api/notices
    @PostMapping
    public Notice postNotice(Principal principal, @RequestBody Notice notice) {
        User manager = getAuthenticatedManager(principal);

        notice.setAuthor(manager);
        notice.setPostedAt(LocalDateTime.now());
        return noticeRepository.save(notice);
    }

    // 2. View all notices (EVERYONE) - URL: GET /api/notices
    @GetMapping
    public List<Notice> getAllNotices() {
        return noticeRepository.findAllByOrderByPostedAtDesc();
    }

    // 3. Delete a notice (MANAGER ONLY) - URL: DELETE /api/notices/{id}
    @DeleteMapping("/{id}")
    public void deleteNotice(@PathVariable Long id, Principal principal) {
        getAuthenticatedManager(principal); // Just checking if they are a manager

        if (!noticeRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Notice not found");
        }
        noticeRepository.deleteById(id);
    }
}