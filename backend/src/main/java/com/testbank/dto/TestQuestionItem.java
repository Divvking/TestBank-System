package com.testbank.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestQuestionItem {
    @NotNull
    private Integer questionId;

    @NotNull
    @DecimalMin("0.5")
    private BigDecimal marks;

    @NotNull
    @Min(1)
    private Integer sequenceOrder;
}
