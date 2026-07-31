package com.testbank.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank
    @Size(min = 2, max = 100)
    private String name;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    // Only FACULTY (2) or STUDENT (3) — ADMIN cannot self-register
    @NotNull
    @Min(value = 2, message = "Invalid role")
    @Max(value = 3, message = "Invalid role")
    private Integer roleId;
}
