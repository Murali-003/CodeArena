package com.codearena.controller;

import com.codearena.dto.testcase.TestCaseRequest;
import com.codearena.dto.testcase.TestCaseResponse;
import com.codearena.service.TestCaseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class TestCaseController {

    private final TestCaseService testCaseService;

    // TODO: re-add @PreAuthorize("hasRole('ADMIN')") once security is wired back in.
    @PostMapping("/api/problems/{problemId}/test-cases")
    public ResponseEntity<TestCaseResponse> create(@PathVariable Long problemId,
                                                    @Valid @RequestBody TestCaseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(testCaseService.create(problemId, request));
    }

    // Public: hidden test cases have their input/expected output stripped
    @GetMapping("/api/problems/{problemId}/test-cases")
    public ResponseEntity<List<TestCaseResponse>> getByProblem(@PathVariable Long problemId) {
        return ResponseEntity.ok(testCaseService.getByProblemPublic(problemId));
    }

    // TODO: re-add @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/api/test-cases/{id}")
    public ResponseEntity<TestCaseResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(testCaseService.getById(id, true));
    }

    // TODO: re-add @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/api/test-cases/{id}")
    public ResponseEntity<TestCaseResponse> update(@PathVariable Long id,
                                                    @Valid @RequestBody TestCaseRequest request) {
        return ResponseEntity.ok(testCaseService.update(id, request));
    }

    // TODO: re-add @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/api/test-cases/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        testCaseService.delete(id);
        return ResponseEntity.noContent().build();
    }
}