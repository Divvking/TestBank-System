package com.testbank.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private Integer userId;
    private String name;
    private String email;
    private String role;
    private LocalDateTime createdAt;
}
