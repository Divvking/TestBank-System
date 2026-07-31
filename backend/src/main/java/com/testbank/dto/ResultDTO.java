package com.testbank.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResultDTO {
    private Integer resultId;
    private Integer attemptId;
    private Integer testId;
    private String testName;
    private BigDecimal score;
    private BigDecimal totalMarks;
    private Integer rankPosition;
    private Integer totalQuestions;
    private Long correctAnswers;
    private LocalDateTime submittedAt;
    private List<ResponseDTO> responses;
}
