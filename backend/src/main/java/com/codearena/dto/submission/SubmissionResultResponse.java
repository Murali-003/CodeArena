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
    private String stdout;
    private String stderr;

public static SubmissionResultResponse fromEntity(
        SubmissionResult r,
        boolean includeOutput) {

    return SubmissionResultResponse.builder()
            .id(r.getId())
            .testCaseId(r.getTestCase() != null ? r.getTestCase().getId() : null)
            .passed(Boolean.TRUE.equals(r.getPassed()))
            .executionTimeMs(
                    r.getExecutionTimeMs() == null ? 0 : r.getExecutionTimeMs()
            )
            .memoryUsedKb(
                    r.getMemoryUsedKb() == null ? 0 : r.getMemoryUsedKb()
            )
            .stdout(includeOutput ? r.getStdout() : null)
            .stderr(includeOutput ? r.getStderr() : null)
            .build();
}
}
