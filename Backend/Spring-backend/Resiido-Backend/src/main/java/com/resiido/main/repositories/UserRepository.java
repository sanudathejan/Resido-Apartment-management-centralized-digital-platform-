package com.resiido.main.repositories;

import com.resiido.main.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // This interface now has methods like .save(), .findAll(), and .findById()
    Optional<User> findByEmail(String email);
}