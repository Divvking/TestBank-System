package com.testbank.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaderboardEntry {
    private Integer rank;
    private String studentName;
    private String email;
    private BigDecimal score;
    private BigDecimal totalMarks;
    private LocalDateTime submittedAt;
}
