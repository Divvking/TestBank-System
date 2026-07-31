package com.testbank.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDTO {
    private Integer categoryId;

    @NotBlank
    @Size(max = 100)
    private String categoryName;
}
