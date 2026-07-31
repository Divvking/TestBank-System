package com.testbank.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttemptDTO {
    private Integer attemptId;
    private Integer testId;
    private String testName;
    private Integer duration;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
}
