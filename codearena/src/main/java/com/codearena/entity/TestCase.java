package com.codearena.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "test_cases")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    @NotBlank(message = "Input data is required")
    @Lob
    @Column(name = "input_data", nullable = false, columnDefinition = "LONGTEXT")
    private String inputData;

    @NotBlank(message = "Expected output is required")
    @Lob
    @Column(name = "expected_output", nullable = false, columnDefinition = "LONGTEXT")
    private String expectedOutput;

    @Column(name = "is_hidden")
    @Builder.Default
    private Boolean isHidden = true;

    // Optional per-test override; if null, engine falls back to the global 5s limit
    @Positive(message = "Time limit override must be positive if provided")
    @Column(name = "time_limit_override")
    private Integer timeLimitOverride;
}