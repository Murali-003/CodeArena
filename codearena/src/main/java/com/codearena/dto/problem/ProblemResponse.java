package com.codearena.dto.problem;

import com.codearena.entity.Problem;
import com.codearena.enums.Difficulty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProblemResponse {

    private Long id;
    private String title;
    private String descriptionMd;
    private Difficulty difficulty;
    private String tags;
    private LocalDateTime createdAt;
    private int testCaseCount;

    public static ProblemResponse fromEntity(Problem problem) {
        return ProblemResponse.builder()
                .id(problem.getId())
                .title(problem.getTitle())
                .descriptionMd(problem.getDescriptionMd())
                .difficulty(problem.getDifficulty())
                .tags(problem.getTags())
                .createdAt(problem.getCreatedAt())
                .testCaseCount(problem.getTestCases() == null ? 0 : problem.getTestCases().size())
                .build();
    }
}
