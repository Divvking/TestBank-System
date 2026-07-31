package com.testbank.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResponseDTO {
    private Integer responseId;
    private Integer questionId;
    private String questionText;
    private String selectedOption;
    private String correctOption;
    private Boolean isCorrect;
    private BigDecimal marksAwarded;
}
