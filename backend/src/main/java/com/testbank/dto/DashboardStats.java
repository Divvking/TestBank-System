package com.testbank.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStats {
    private Long totalTests;
    private Long totalQuestions;
    private Long totalStudents;
    private Long totalAttempts;
    private BigDecimal averageScore;
}
