package com.codearena.controller;

import com.codearena.dto.submission.SubmissionRequest;
import com.codearena.dto.submission.SubmissionResponse;
import com.codearena.service.SubmissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    // TEMPORARY: userId comes from a request param for now since JWT isn't wired up yet.
    // Once your teammate adds the security filter, replace this with the authenticated
    // principal's id (Authentication -> CustomUserDetails -> getId()) and drop the param.
    @PostMapping
    public ResponseEntity<SubmissionResponse> submit(@RequestParam Long userId,
                                                       @Valid @RequestBody SubmissionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(submissionService.submit(userId, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubmissionResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(submissionService.getById(id, true));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<SubmissionResponse>> getUserSubmissions(@PathVariable Long userId,
                                                                        Pageable pageable) {
        return ResponseEntity.ok(submissionService.getUserSubmissions(userId, pageable));
    }
}