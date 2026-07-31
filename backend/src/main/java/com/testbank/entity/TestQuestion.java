package com.testbank.entity;

import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;
import java.math.BigDecimal;

@Entity
@Table(name = "test_question")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
@IdClass(TestQuestion.TestQuestionId.class)
public class TestQuestion {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_id")
    private Test test;

    @Id
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "question_id")
    private Question question;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal marks;

    @Column(nullable = false)
    private Integer sequenceOrder;

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class TestQuestionId implements Serializable {
        private Integer test;
        private Integer question;
    }
}
