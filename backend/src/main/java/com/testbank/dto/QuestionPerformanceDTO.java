package com.testbank.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionPerformanceDTO {
    private Integer questionId;
    private String questionText;
    private String categoryName;
    private String difficulty;
    private Long totalAttempts;
    private Long correctCount;
    private BigDecimal accuracyPct;
}
