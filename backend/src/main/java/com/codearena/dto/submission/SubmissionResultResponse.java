package com.codearena.dto.submission;

import com.codearena.entity.SubmissionResult;

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
public class SubmissionResultResponse {

    private Long id;
    private Long testCaseId;
    private boolean passed;
    private Integer executionTimeMs;
    private Integer memoryUsedKb;
    // stdout/stderr omitted by default for non-hidden-safe views; include explicitly if needed
        private String actualOutput;
        private String expectedOutput;

        private String errorMessage;

public static SubmissionResultResponse fromEntity(
        SubmissionResult r,
        boolean includeOutput) {

        return SubmissionResultResponse.builder()
            .id(r.getId())
            .testCaseId(r.getTestCase() != null ? r.getTestCase().getId() : null)
            .passed(Boolean.TRUE.equals(r.getPassed()))
        .executionTimeMs(java.util.Objects.requireNonNullElse(r.getExecutionTimeMs(),0))
                .memoryUsedKb(
    java.util.Objects.requireNonNullElse(
        r.getMemoryUsedKb(),
        0
    )
)
                    .actualOutput(includeOutput ? r.getActualOutput() : null)
        .expectedOutput(includeOutput ? r.getExpectedOutput() : null)
        .errorMessage(includeOutput ? r.getErrorMessage() : null)
            .build();
}
}
