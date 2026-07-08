package com.codearena.service;

import com.codearena.dto.testcase.TestCaseRequest;
import com.codearena.dto.testcase.TestCaseResponse;
import com.codearena.entity.Problem;
import com.codearena.entity.TestCase;
import com.codearena.exception.InvalidSubmissionException;
import com.codearena.exception.ResourceNotFoundException;
import com.codearena.repository.TestCaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TestCaseService {

    private final TestCaseRepository testCaseRepository;
    private final ProblemService problemService;

    public TestCaseResponse create(Long problemId, TestCaseRequest request) {
        Problem problem = problemService.findEntityOrThrow(problemId);

        TestCase testCase = TestCase.builder()
                .problem(problem)
                .inputData(request.getInputData())
                .expectedOutput(request.getExpectedOutput())
                .isHidden(request.getIsHidden() == null ? Boolean.TRUE : request.getIsHidden())
                .timeLimitOverride(request.getTimeLimitOverride())
                .build();

        return TestCaseResponse.fromEntity(testCaseRepository.save(testCase), true);
    }

    @Transactional(readOnly = true)
    public TestCaseResponse getById(Long id, boolean includeHiddenDetails) {
        return TestCaseResponse.fromEntity(findEntityOrThrow(id), includeHiddenDetails);
    }

    // Public browsing view (e.g. shown on the problem page before submission):
    // hides input/expected output for hidden test cases.
    @Transactional(readOnly = true)
    public List<TestCaseResponse> getByProblemPublic(Long problemId) {
        return testCaseRepository.findByProblemId(problemId).stream()
                .map(tc -> TestCaseResponse.fromEntity(tc, false))
                .toList();
    }

    // Admin/internal view used by the execution engine — needs full details on every test case
    @Transactional(readOnly = true)
    public List<TestCase> getByProblemForExecution(Long problemId) {
        List<TestCase> testCases = testCaseRepository.findByProblemId(problemId);
        if (testCases.isEmpty()) {
            throw new InvalidSubmissionException(
                    "Problem " + problemId + " has no test cases configured yet");
        }
        return testCases;
    }

    public TestCaseResponse update(Long id, TestCaseRequest request) {
        TestCase testCase = findEntityOrThrow(id);
        testCase.setInputData(request.getInputData());
        testCase.setExpectedOutput(request.getExpectedOutput());
        if (request.getIsHidden() != null) {
            testCase.setIsHidden(request.getIsHidden());
        }
        testCase.setTimeLimitOverride(request.getTimeLimitOverride());
        return TestCaseResponse.fromEntity(testCase, true);
    }

    public void delete(Long id) {
        TestCase testCase = findEntityOrThrow(id);
        testCaseRepository.delete(testCase);
    }

    @Transactional(readOnly = true)
    public TestCase findEntityOrThrow(Long id) {
        return testCaseRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("TestCase", id));
    }
}
