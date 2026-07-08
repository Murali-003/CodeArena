package com.codearena.dto.problem;

import com.codearena.entity.Problem;
import com.codearena.enums.Difficulty;
import com.codearena.dto.testcase.TestCaseResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProblemResponse {

    private Long id;
    private String title;
    private String description;
    private Difficulty difficulty;
    private String category;
    private LocalDateTime createdAt;
    private int testCaseCount;
    private List<TestCaseResponse> testCases;

    public static ProblemResponse fromEntity(Problem problem, boolean includeHidden) {
        return ProblemResponse.builder()
                .id(problem.getId())
                .title(problem.getTitle())
                .description(problem.getDescriptionMd())
                .difficulty(problem.getDifficulty())
                .category(problem.getTags())
                .createdAt(problem.getCreatedAt())
                .testCaseCount(problem.getTestCases() == null ? 0 : problem.getTestCases().size())
                .testCases(problem.getTestCases() == null ? null : problem.getTestCases().stream()
                        .filter(tc -> includeHidden || !Boolean.TRUE.equals(tc.getIsHidden()))
                        .map(tc -> TestCaseResponse.fromEntity(tc, includeHidden))
                        .collect(Collectors.toList()))
                .build();
    }
}
