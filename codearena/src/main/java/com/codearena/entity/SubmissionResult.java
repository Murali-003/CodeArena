package com.codearena.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "submission_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmissionResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "submission_id", nullable = false)
    private Submission submission;

    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "test_case_id", nullable = false)
    private TestCase testCase;

    @NotNull(message = "passed flag is required")
    @Column(nullable = false)
    private Boolean passed;

    @NotNull(message = "execution time is required")
    @PositiveOrZero(message = "execution time cannot be negative")
    @Column(name = "execution_time_ms", nullable = false)
    private Integer executionTimeMs;

    @NotNull(message = "memory usage is required")
    @PositiveOrZero(message = "memory used cannot be negative")
    @Column(name = "memory_used_kb", nullable = false)
    private Integer memoryUsedKb;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String stdout;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String stderr;
}
