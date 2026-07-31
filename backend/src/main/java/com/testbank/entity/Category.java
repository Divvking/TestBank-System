package com.testbank.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "category")
@Data @NoArgsConstructor @AllArgsConstructor
public class Category {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer categoryId;

    @Column(nullable = false, unique = true, length = 100)
    private String categoryName;
}
