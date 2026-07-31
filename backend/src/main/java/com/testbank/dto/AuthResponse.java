package com.testbank.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private String name;
    private String email;
    private String role;
    private Integer userId;
}
