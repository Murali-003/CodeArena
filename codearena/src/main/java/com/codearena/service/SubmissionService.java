package com.codearena.service;

import com.codearena.dto.submission.SubmissionRequest;
import com.codearena.dto.submission.SubmissionResponse;
import com.codearena.dto.submission.SubmissionResultResponse;
import com.codearena.entity.Problem;
import com.codearena.entity.Submission;
import com.codearena.entity.User;
import com.codearena.enums.SubmissionStatus;
import com.codearena.exception.InvalidSubmissionException;
import com.codearena.exception.ResourceNotFoundException;
import com.codearena.repository.SubmissionRepository;
import com.codearena.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

// NOTE: assumes a UserRepository already exists in com.codearena.repository
// (JpaRepository<User, Long>). Swap the import/package if yours differs.
@Service
@RequiredArgsConstructor
@Transactional
public class SubmissionService {

    private static final int MAX_SUBMISSIONS_PER_WINDOW = 5;
    private static final int RATE_LIMIT_WINDOW_MINUTES = 1;

    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;
    private final ProblemService problemService;
    private final TestCaseService testCaseService;

    public SubmissionResponse submit(Long userId, SubmissionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("User", userId));

        Problem problem = problemService.findEntityOrThrow(request.getProblemId());

        // Fail fast if there are no test cases at all — nothing meaningful to grade against
        testCaseService.getByProblemForExecution(problem.getId());

        enforceRateLimit(userId, problem.getId());

        Submission submission = Submission.builder()
                .user(user)
                .problem(problem)
                .language(request.getLanguage())
                .sourceCode(request.getSourceCode())
                .status(SubmissionStatus.PENDING)
                .build();

        submission = submissionRepository.save(submission);

        // Actual compile/run against the sandboxed engine happens asynchronously elsewhere
        // (the execution engine module) and updates this row's status + submission_results.
        return SubmissionResponse.fromEntity(submission, List.of());
    }

    private void enforceRateLimit(Long userId, Long problemId) {
        LocalDateTime windowStart = LocalDateTime.now().minusMinutes(RATE_LIMIT_WINDOW_MINUTES);
        long recentCount = submissionRepository.countRecentSubmissions(userId, problemId, windowStart);
        if (recentCount >= MAX_SUBMISSIONS_PER_WINDOW) {
            throw new InvalidSubmissionException(
                    "Rate limit exceeded: max " + MAX_SUBMISSIONS_PER_WINDOW +
                    " submissions per problem per minute. Please wait before retrying.");
        }
    }

    @Transactional(readOnly = true)
    public SubmissionResponse getById(Long id, boolean includeOutput) {
        Submission submission = findEntityOrThrow(id);
        List<SubmissionResultResponse> results = submission.getSubmissionResults().stream()
                .map(r -> SubmissionResultResponse.fromEntity(r, includeOutput))
                .toList();
        return SubmissionResponse.fromEntity(submission, results);
    }

    @Transactional(readOnly = true)
    public Page<SubmissionResponse> getUserSubmissions(Long userId, Pageable pageable) {
        return submissionRepository.findByUserIdOrderBySubmittedAtDesc(userId, pageable)
                .map(s -> SubmissionResponse.fromEntity(s, List.of()));
    }

    // Called by the execution engine once grading completes
    public void updateStatus(Long submissionId, SubmissionStatus newStatus) {
        Submission submission = findEntityOrThrow(submissionId);
        submission.setStatus(newStatus);
    }

    @Transactional(readOnly = true)
    public Submission findEntityOrThrow(Long id) {
        return submissionRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Submission", id));
    }
}
