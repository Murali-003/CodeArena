package com.codearena.dto.testcase;

import com.codearena.entity.TestCase;
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
public class TestCaseResponse {

    private Long id;
    private Long problemId;
    private String inputData;
    private String expectedOutput;
    private Boolean isHidden;
    private Integer timeLimitOverride;

    // For non-admin users viewing a problem, hidden test cases should not leak input/expected output.
    // Use fromEntity(tc, false) for public views, true for admin/internal views.
    public static TestCaseResponse fromEntity(TestCase tc, boolean includeHiddenDetails) {
        boolean hide = Boolean.TRUE.equals(tc.getIsHidden()) && !includeHiddenDetails;
        return TestCaseResponse.builder()
                .id(tc.getId())
                .problemId(tc.getProblem() != null ? tc.getProblem().getId() : null)
                .inputData(hide ? null : tc.getInputData())
                .expectedOutput(hide ? null : tc.getExpectedOutput())
                .isHidden(tc.getIsHidden())
                .timeLimitOverride(tc.getTimeLimitOverride())
                .build();
    }
}
