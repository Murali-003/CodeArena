package com.codearena.entity;

import com.codearena.enums.Difficulty;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "problems")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Problem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title is required")
    @Column(nullable = false)
    private String title;

    @NotBlank(message = "Description is required")
    @Lob
    @Column(name = "description_md", nullable = false, columnDefinition = "LONGTEXT")
    private String descriptionMd;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Difficulty difficulty;

    // Comma-separated tags, e.g. "arrays,two-pointers"
    @Column(length = 255)
    private String tags;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Not persisted as a DB column directly — inverse side of the FK in test_cases.
    // cascade + orphanRemoval so deleting a Problem cleans up its TestCases (mirrors ON DELETE CASCADE)
    @ToString.Exclude
    @Builder.Default
    @OneToMany(mappedBy = "problem", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<TestCase> testCases = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // Convenience method to keep both sides of the relationship in sync
    public void addTestCase(TestCase testCase) {
        testCases.add(testCase);
        testCase.setProblem(this);
    }

    public void removeTestCase(TestCase testCase) {
        testCases.remove(testCase);
        testCase.setProblem(null);
    }
}