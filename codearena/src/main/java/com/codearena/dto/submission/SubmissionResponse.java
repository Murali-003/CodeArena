package com.codearena.dto.submission;

import com.codearena.entity.Submission;
import com.codearena.enums.Language;
import com.codearena.enums.SubmissionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

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
    private List<SubmissionResultResponse> results;

    public static SubmissionResponse fromEntity(Submission s, List<SubmissionResultResponse> results) {
        return SubmissionResponse.builder()
                .id(s.getId())
                .userId(s.getUser() != null ? s.getUser().getId() : null)
                .problemId(s.getProblem() != null ? s.getProblem().getId() : null)
                .language(s.getLanguage())
                .status(s.getStatus())
                .submittedAt(s.getSubmittedAt())
                .results(results)
                .build();
    }
}
