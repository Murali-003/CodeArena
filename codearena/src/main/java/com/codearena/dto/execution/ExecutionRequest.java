package com.codearena.dto.execution;

import com.codearena.enums.Language;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ExecutionRequest {
    @NotBlank(message = "Source code is required")
    private String sourceCode;

    @NotNull(message = "Language is required")
    private Language language;

    private String customInput;
}
