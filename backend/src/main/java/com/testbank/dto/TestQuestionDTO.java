package com.testbank.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestQuestionDTO {
    private Integer questionId;
    private String questionText;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private String difficulty;
    private BigDecimal marks;
    private Integer sequenceOrder;
}
