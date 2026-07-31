package com.testbank.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "role")
@Data @NoArgsConstructor @AllArgsConstructor
public class Role {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer roleId;

    @Column(nullable = false, unique = true, length = 50)
    private String roleName;
}
