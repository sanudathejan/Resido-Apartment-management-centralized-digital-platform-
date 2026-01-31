package com.resiido.main.repositories;

import com.resiido.main.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // This interface now has methods like .save(), .findAll(), and .findById()
}