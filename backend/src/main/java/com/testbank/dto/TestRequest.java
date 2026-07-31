package com.testbank.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestRequest {

    @NotBlank
    @Size(max = 200)
    private String testName;

    @NotNull
    @Min(1)
    private Integer duration;

    private Boolean isRandomized;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private List<TestQuestionItem> questions;
}