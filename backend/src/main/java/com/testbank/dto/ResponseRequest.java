package com.testbank.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResponseRequest {
    @NotNull
    private Integer questionId;

    @Pattern(regexp = "[ABCD]", message = "Must be A, B, C or D")
    private String selectedOption;
}
