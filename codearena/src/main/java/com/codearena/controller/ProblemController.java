package com.codearena.controller;

import com.codearena.dto.problem.ProblemRequest;
import com.codearena.dto.problem.ProblemResponse;
import com.codearena.enums.Difficulty;
import com.codearena.service.ProblemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<ProblemResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(problemService.getById(id));
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