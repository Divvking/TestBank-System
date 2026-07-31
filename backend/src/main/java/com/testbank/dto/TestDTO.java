package com.testbank.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestDTO {

    private Integer testId;
    private String testName;
    private Integer duration;
    private BigDecimal totalMarks;
    private Boolean isRandomized;
    private String createdBy;
    private LocalDateTime createdAt;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private Integer questionCount;
    private List<TestQuestionDTO> questions;
}