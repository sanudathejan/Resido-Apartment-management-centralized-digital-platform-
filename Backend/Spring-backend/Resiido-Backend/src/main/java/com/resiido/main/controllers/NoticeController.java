package com.resiido.main.controllers;

import com.resiido.main.models.Notice;
import com.resiido.main.models.User;
import com.resiido.main.repositories.NoticeRepository;
import com.resiido.main.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/notices")
public class NoticeController {

    @Autowired
    private NoticeRepository noticeRepository;

    @Autowired
    private UserRepository userRepository;

    // 1. Manager: Post a new notice
    @PostMapping("/{managerId}")
    public Notice postNotice(@PathVariable Long managerId, @RequestBody Notice notice) {
        User user = userRepository.findById(managerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!"MANAGER".equalsIgnoreCase(user.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only managers can post notices.");
        }

        notice.setAuthor(user);
        notice.setPostedAt(LocalDateTime.now());
        return noticeRepository.save(notice);
    }

    // 2. Everyone: View all notices (Newest first)
    @GetMapping
    public List<Notice> getAllNotices() {
        return noticeRepository.findAllByOrderByPostedAtDesc();
    }

    // 3. Manager: Delete an old notice
    @DeleteMapping("/{id}/{managerId}")
    public void deleteNotice(@PathVariable Long id, @PathVariable Long managerId) {
        User user = userRepository.findById(managerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!"MANAGER".equalsIgnoreCase(user.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only managers can delete notices.");
        }

        noticeRepository.deleteById(id);
    }
}