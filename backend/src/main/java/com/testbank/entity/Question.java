package com.testbank.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "question")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Question {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer questionId;

    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @Column(name = "option_a", nullable = false, length = 500)
    private String optionA;

    @Column(name = "option_b", nullable = false, length = 500)
    private String optionB;

    @Column(name = "option_c", nullable = false, length = 500)
    private String optionC;

    @Column(name = "option_d", nullable = false, length = 500)
    private String optionD;

    @Column(name = "correct_option", nullable = false, length = 1)
    private String correctOption;

    @Column(name = "difficulty", nullable = false, length = 10)
    private String difficulty;

    @Column(name = "default_marks", nullable = false, precision = 5, scale = 2)
    private BigDecimal defaultMarks;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;
}