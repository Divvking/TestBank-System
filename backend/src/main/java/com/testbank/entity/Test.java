package com.testbank.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "test")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Test {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer testId;

    @Column(nullable = false, length = 200)
    private String testName;

    @Column(nullable = false)
    private Integer duration;

    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal totalMarks;

    @Column(nullable = false)
    private Boolean isRandomized = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    // ✅ ADD THESE TWO
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    @OneToMany(mappedBy = "test", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sequenceOrder ASC")
    private List<TestQuestion> testQuestions = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        if (isRandomized == null) isRandomized = false;
    }
}