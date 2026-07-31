package com.testbank.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "attempt")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Attempt {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer attemptId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_id", nullable = false)
    private Test test;

    @Column(nullable = false)
    private LocalDateTime startTime;

    private LocalDateTime endTime;

    @Column(nullable = false, length = 20)
    private String status;

    @PrePersist
    public void prePersist() {
        if (startTime == null) startTime = LocalDateTime.now();
        if (status == null) status = "IN_PROGRESS";
    }
}
