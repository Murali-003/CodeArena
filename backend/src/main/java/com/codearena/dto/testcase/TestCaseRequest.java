package com.codearena.dto.testcase;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestCaseRequest {

    @NotBlank(message = "Input data is required")
    private String inputData;

    @NotBlank(message = "Expected output is required")
    private String expectedOutput;

    private Boolean isHidden;

    @Positive(message = "Time limit override must be positive if provided")
    private Integer timeLimitOverride;
}
