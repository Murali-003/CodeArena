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
import com.codearena.service.executor.CodeExecutionRequest;
import com.codearena.service.executor.CodeExecutionResult;
import com.codearena.service.executor.CodeExecutor;
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
    private final CodeExecutor codeExecutor;
    private final LeaderboardService leaderboardService;
    private final SubmissionResultService submissionResultService;

    public SubmissionResponse submit(Long userId, SubmissionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("User", userId));

        Problem problem = problemService.findEntityOrThrow(request.getProblemId());

        // Fail fast if there are no test cases at all — nothing meaningful to grade against
        List<com.codearena.entity.TestCase> testCases = testCaseService.getByProblemForExecution(problem.getId());

        enforceRateLimit(userId, problem.getId());

        Submission submission = Submission.builder()
                .user(user)
                .problem(problem)
                .language(request.getLanguage())
                .sourceCode(request.getSourceCode())
                .status(SubmissionStatus.PENDING)
                .build();

        submission = submissionRepository.save(submission);

        // Execute the code synchronously (Milestone 1: prove engine is reachable)
        submission.setStatus(SubmissionStatus.RUNNING);
        submission = submissionRepository.save(submission);

        try {
            SubmissionStatus finalStatus = SubmissionStatus.ACCEPTED;
            boolean allPassed = true;

            for (com.codearena.entity.TestCase testCase : testCases) {
                CodeExecutionRequest execRequest = new CodeExecutionRequest(
                        submission.getSourceCode(),
                        submission.getLanguage().name(),
                        testCase.getInputData()
                );
                CodeExecutionResult result = codeExecutor.execute(execRequest);

                if (!"SUCCESS".equals(result.status())) {
                    finalStatus = switch (result.status()) {
                        case "COMPILATION_ERROR" -> SubmissionStatus.COMPILATION_ERROR;
                        case "TIME_LIMIT_EXCEEDED" -> SubmissionStatus.TIME_LIMIT_EXCEEDED;
                        case "MEMORY_LIMIT_EXCEEDED" -> SubmissionStatus.MEMORY_LIMIT_EXCEEDED;
                        default -> SubmissionStatus.RUNTIME_ERROR;
                    };
                    break;
                }

                boolean passed = compareOutput(result.stdout(), testCase.getExpectedOutput());
                if (!passed) {
                    allPassed = false;
                }

                submissionResultService.recordResult(
                        submission, testCase, passed,
                        (int) result.execTimeMs(), 0,
                        result.stdout(), result.stderr()
                );
            }

            if (finalStatus == SubmissionStatus.ACCEPTED && !allPassed) {
                finalStatus = SubmissionStatus.WRONG_ANSWER;
            }

            submission.setStatus(finalStatus);
            submission = submissionRepository.save(submission);

            if (finalStatus == SubmissionStatus.ACCEPTED) {
                long problemsSolved = submissionRepository.countDistinctProblemIdByUserIdAndStatus(userId, SubmissionStatus.ACCEPTED);
                long acceptedCount = submissionRepository.countByUserIdAndStatus(userId, SubmissionStatus.ACCEPTED);
                long totalCount = submissionRepository.countByUserId(userId);
                leaderboardService.recalculate(userId, (int) problemsSolved, acceptedCount, totalCount);
            }

        } catch (Exception e) {
            submission.setStatus(SubmissionStatus.RUNTIME_ERROR);
            submission = submissionRepository.save(submission);
        }

        return SubmissionResponse.fromEntity(submission, submissionResultService.getBySubmission(submission.getId(), true));
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
        List<SubmissionResultResponse> results = submissionResultService.getBySubmission(id, includeOutput);
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

    private boolean compareOutput(String actualOutput, String expectedOutput) {
        if (expectedOutput == null) expectedOutput = "";
        if (actualOutput == null) actualOutput = "";

        String[] actualLines = actualOutput.split("\\r?\\n");
        String[] expectedLines = expectedOutput.split("\\r?\\n");

        int actualLen = actualLines.length;
        while (actualLen > 0 && actualLines[actualLen - 1].trim().isEmpty()) {
            actualLen--;
        }

        int expectedLen = expectedLines.length;
        while (expectedLen > 0 && expectedLines[expectedLen - 1].trim().isEmpty()) {
            expectedLen--;
        }

        if (actualLen != expectedLen) {
            return false;
        }

        for (int i = 0; i < actualLen; i++) {
            if (!actualLines[i].trim().equals(expectedLines[i].trim())) {
                return false;
            }
        }

        return true;
    }
}
