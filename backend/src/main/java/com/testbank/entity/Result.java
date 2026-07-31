package com.testbank.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "result")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Result {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer resultId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false, unique = true)
    private Attempt attempt;

    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal score;

    private Integer rankPosition;
}
