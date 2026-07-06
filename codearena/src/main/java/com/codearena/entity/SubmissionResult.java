package com.codearena.entity;

import jakarta.persistence.*;
import lombok.*;

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

    @Column(nullable = false)
    private Boolean passed;

    @Column(name = "execution_time_ms")
    private Integer executionTimeMs;

    @Column(name = "memory_used_kb")
    private Integer memoryUsedKb;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String stdout;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String stderr;
}
