package com.resiido.main.models;

import lombok.Data;

@Data
public class AuthRequest {
    private String email;
    private String password;
}
