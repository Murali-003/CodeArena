package com.codearena.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.codearena.dto.problem.HintRequest;
import com.codearena.dto.problem.ProblemRequest;
import com.codearena.dto.problem.ProblemResponse;
import com.codearena.entity.Problem;
import com.codearena.entity.ProblemHint;
import com.codearena.enums.Difficulty;
import com.codearena.exception.DuplicateResourceException;
import com.codearena.exception.ResourceNotFoundException;
import com.codearena.repository.ProblemRepository;
import com.codearena.repository.SubmissionRepository;
import com.codearena.repository.UserRepository;

import lombok.RequiredArgsConstructor;
@Service
@RequiredArgsConstructor
@Transactional
public class ProblemService {

    private final ProblemRepository problemRepository;
    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;
@Transactional(readOnly = true)
public ProblemResponse getByIdForUser(Long problemId, Long userId) {

    Problem problem = findEntityOrThrow(problemId);

    long failedAttempts =
            submissionRepository.countFailedAttempts(userId, problemId);

    System.out.println("========== HINT DEBUG ==========");
    System.out.println("Failed Attempts = " + failedAttempts);
    problem.getHints().forEach(h ->
        System.out.println(
            h.getHintText() + " -> unlockAfter=" + h.getUnlockAfterAttempts()
        )
    );

    return ProblemResponse.fromEntity(
            problem,
            false,
            (int) failedAttempts
    );
}
public ProblemResponse create(ProblemRequest request) {
    if (problemRepository.existsByTitleIgnoreCase(request.getTitle())) {
        throw new DuplicateResourceException(
                "A problem titled '" + request.getTitle() + "' already exists");
    }

    Problem problem = Problem.builder()
            .title(request.getTitle())
            .descriptionMd(request.getDescriptionMd())
            .difficulty(request.getDifficulty())
            .tags(request.getTags())
            .memoryLimitMb(request.getMemoryLimitMb())
            .timeLimitMs(request.getTimeLimitMs())
            .build();

    if (request.getHints() != null) {
        for (HintRequest hintRequest : request.getHints()) {

            ProblemHint hint = ProblemHint.builder()
                    .displayOrder(hintRequest.getDisplayOrder())
                    .hintText(hintRequest.getHintText())
                    .unlockAfterAttempts(hintRequest.getUnlockAfterAttempts())
                    .build();

            hint.setProblem(problem);
            problem.getHints().add(hint);
        }
    }

    Problem savedProblem = problemRepository.save(problem);

    return ProblemResponse.fromEntity(savedProblem, true);
}

    @Transactional(readOnly = true)
    public ProblemResponse getById(Long id) {
        // This is called by both Admin and User. Let's make it includeHidden=false to be safe, 
        // since Admin can just hit the /api/problems (getAll) which returns everything.
        // Wait, AdminTab currently edits using the data from getAll(). Let's pass false here.
        return ProblemResponse.fromEntity(findEntityOrThrow(id), false);
    }
    
    @Transactional(readOnly = true)
    public ProblemResponse getByIdAdmin(Long id) {
        return ProblemResponse.fromEntity(findEntityOrThrow(id), true);
    }

    @Transactional(readOnly = true)
    public Page<ProblemResponse> getByDifficulty(Difficulty difficulty, Pageable pageable) {
        // Public list
        return problemRepository.findByDifficulty(difficulty, pageable)
                .map(p -> ProblemResponse.fromEntity(p, false));
    }

    @Transactional(readOnly = true)
    public Page<ProblemResponse> getAll(Pageable pageable) {
        // Used by AdminTab.tsx
        return problemRepository.findAll(pageable).map(p -> ProblemResponse.fromEntity(p, true));
    }

    public ProblemResponse update(Long id, ProblemRequest request) {
        Problem problem = findEntityOrThrow(id);

        // Only enforce uniqueness if the title is actually changing
        if (!problem.getTitle().equalsIgnoreCase(request.getTitle())
                && problemRepository.existsByTitleIgnoreCase(request.getTitle())) {
            throw new DuplicateResourceException(
                    "A problem titled '" + request.getTitle() + "' already exists");
        }

        problem.setTitle(request.getTitle());
problem.setDescriptionMd(request.getDescriptionMd());
problem.setDifficulty(request.getDifficulty());
problem.setTags(request.getTags());
problem.setMemoryLimitMb(request.getMemoryLimitMb());
problem.setTimeLimitMs(request.getTimeLimitMs());

// Replace existing hints
problem.getHints().clear();

if (request.getHints() != null) {
    for (HintRequest hintRequest : request.getHints()) {

        ProblemHint hint = ProblemHint.builder()
                .displayOrder(hintRequest.getDisplayOrder())
                .hintText(hintRequest.getHintText())
                .unlockAfterAttempts(hintRequest.getUnlockAfterAttempts())
                .build();

        hint.setProblem(problem);
        problem.getHints().add(hint);
    }
}



return ProblemResponse.fromEntity(problem, true);
    }

    public void delete(Long id) {
        Problem problem = findEntityOrThrow(id);
        problemRepository.delete(problem);
    }

    // Package-visible so SubmissionService/TestCaseService can fetch the managed entity
    // (not just the DTO) without duplicating the not-found logic.
    @Transactional(readOnly = true)
    public Problem findEntityOrThrow(Long id) {
        return problemRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Problem", id));
    }
}
