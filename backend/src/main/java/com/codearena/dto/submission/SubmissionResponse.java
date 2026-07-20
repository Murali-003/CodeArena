package com.codearena.dto.submission;

import java.time.LocalDateTime;
import java.util.List;

import com.codearena.entity.Submission;
import com.codearena.enums.Language;
import com.codearena.enums.SubmissionStatus;

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
public class SubmissionResponse {

    private Long id;
    private Long userId;
    private Long problemId;
    private Language language;
    private SubmissionStatus status;
    private LocalDateTime submittedAt;
    private Integer passedTestCases;
    private Integer totalTestCases;
    private List<SubmissionResultResponse> results;
    private String sourceCode;

    public static SubmissionResponse fromEntity(Submission s, List<SubmissionResultResponse> results) {
        int total = results.size();

        int passed = (int) results.stream()
            .filter(SubmissionResultResponse::isPassed)
            .count();
            
        return SubmissionResponse.builder()
                .id(s.getId())
                .userId(s.getUser() != null ? s.getUser().getId() : null)
                .problemId(s.getProblem() != null ? s.getProblem().getId() : null)
                .language(s.getLanguage())
                .status(s.getStatus())
                .submittedAt(s.getSubmittedAt())
                .passedTestCases(passed)
                .totalTestCases(total)
                .results(results)
                .sourceCode(s.getSourceCode())
                .build();
    }
}
