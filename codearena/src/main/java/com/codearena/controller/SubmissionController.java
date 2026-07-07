package com.codearena.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.codearena.dto.submission.SubmissionRequest;
import com.codearena.dto.submission.SubmissionResponse;
import com.codearena.security.CustomUserDetails;
import com.codearena.service.SubmissionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    @PostMapping
    public ResponseEntity<SubmissionResponse> submit(
            @AuthenticationPrincipal CustomUserDetails user,
            @Valid @RequestBody SubmissionRequest request) {

        return ResponseEntity.ok(
                submissionService.submit(user.getId(), request)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubmissionResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(submissionService.getById(id, true));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<SubmissionResponse>> getUserSubmissions(
            @AuthenticationPrincipal CustomUserDetails user,
            Pageable pageable) {

        return ResponseEntity.ok(
                submissionService.getUserSubmissions(user.getId(), pageable)
        );
    }
}