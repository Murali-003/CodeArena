package com.codearena.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.codearena.dto.problem.ProblemRequest;
import com.codearena.dto.problem.ProblemResponse;
import com.codearena.enums.Difficulty;
import com.codearena.security.CustomUserDetails;
import com.codearena.service.ProblemService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/problems")
@RequiredArgsConstructor
public class ProblemController {

    private final ProblemService problemService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ProblemResponse> create(@Valid @RequestBody ProblemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(problemService.create(request));
    }

@GetMapping("/{id}")
public ResponseEntity<ProblemResponse> getById(
        @PathVariable Long id,
        @AuthenticationPrincipal CustomUserDetails user) {

    return ResponseEntity.ok(
            problemService.getByIdForUser(id, user.getId())
    );
}

    @GetMapping
    public ResponseEntity<Page<ProblemResponse>> getAll(
            @RequestParam(required = false) Difficulty difficulty,
            Pageable pageable) {
        Page<ProblemResponse> result = difficulty == null
                ? problemService.getAll(pageable)
                : problemService.getByDifficulty(difficulty, pageable);
        return ResponseEntity.ok(result);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ProblemResponse> update(@PathVariable Long id,
                                                   @Valid @RequestBody ProblemRequest request) {
        return ResponseEntity.ok(problemService.update(id, request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        problemService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
