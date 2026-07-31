package com.testbank.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionRequest {
    @NotBlank
    private String questionText;

    @NotBlank
    private String optionA;

    @NotBlank
    private String optionB;

    @NotBlank
    private String optionC;

    @NotBlank
    private String optionD;

    @NotBlank
    @Pattern(regexp = "[ABCD]", message = "Must be A, B, C or D")
    private String correctOption;

    @NotBlank
    @Pattern(regexp = "easy|medium|hard", message = "Must be easy, medium or hard")
    private String difficulty;

    @NotNull
    @DecimalMin("0.5")
    private BigDecimal defaultMarks;

    private Integer categoryId;
}
