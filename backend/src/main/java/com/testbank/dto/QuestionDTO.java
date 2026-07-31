package com.testbank.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionDTO {
    private Integer questionId;
    private String questionText;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private String correctOption;
    private String difficulty;
    private BigDecimal defaultMarks;
    private String categoryName;
    private Integer categoryId;
    private String createdBy;
}
