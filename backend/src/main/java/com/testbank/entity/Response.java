package com.testbank.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "response", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"attempt_id", "question_id"})
})
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Response {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer responseId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    private Attempt attempt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(name = "selected_option", columnDefinition = "CHAR(1)")
    private String selectedOption;

    @Column(name = "is_correct")
    private Boolean isCorrect;

    @Column(name = "marks_awarded", precision = 5, scale = 2)
    private BigDecimal marksAwarded;
}
