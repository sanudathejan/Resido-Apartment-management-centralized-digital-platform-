package com.resiido.main.repositories;

import com.resiido.main.models.Notice;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NoticeRepository extends JpaRepository<Notice, Long> {
    // Fetches notices and sorts them by date so the newest is at the top
    List<Notice> findAllByOrderByPostedAtDesc();
}