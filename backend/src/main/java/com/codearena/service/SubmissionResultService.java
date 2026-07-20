package com.codearena.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.codearena.dto.submission.SubmissionResultResponse;
import com.codearena.entity.Submission;
import com.codearena.entity.SubmissionResult;
import com.codearena.entity.TestCase;
import com.codearena.repository.SubmissionResultRepository;

import lombok.RequiredArgsConstructor;

// This is the layer the execution engine writes to: one row per test case,
// per submission, produced after the container run finishes.
@Service
@RequiredArgsConstructor
@Transactional
public class SubmissionResultService {

    private final SubmissionResultRepository submissionResultRepository;

    public SubmissionResultResponse recordResult(Submission submission, TestCase testCase,
                                                  boolean passed, int executionTimeMs,
                                                  int memoryUsedKb, String actualOutput,String expectedOutput,String errorMessage) {
        SubmissionResult result = SubmissionResult.builder()
                .submission(submission)
                .testCase(testCase)
                .passed(passed)
                .executionTimeMs(executionTimeMs)
                .memoryUsedKb(memoryUsedKb)
                
        .actualOutput(actualOutput)
        .expectedOutput(expectedOutput)
        .errorMessage(errorMessage)
                .build();
        return SubmissionResultResponse.fromEntity(submissionResultRepository.save(result), true);
    }

    @Transactional(readOnly = true)
    public List<SubmissionResultResponse> getBySubmission(Long submissionId, boolean includeOutput) {
        return submissionResultRepository.findBySubmissionId(submissionId).stream()
                .map(r -> {
                    boolean expose = includeOutput && !r.getTestCase().getIsHidden();
                    return SubmissionResultResponse.fromEntity(r, expose);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public boolean allPassed(Long submissionId) {
        long total = submissionResultRepository.countBySubmissionId(submissionId);
        long passed = submissionResultRepository.countBySubmissionIdAndPassedTrue(submissionId);
        return total > 0 && total == passed;
    }
}
