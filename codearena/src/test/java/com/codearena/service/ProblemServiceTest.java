package com.codearena.service;

import com.codearena.dto.problem.ProblemRequest;
import com.codearena.dto.problem.ProblemResponse;
import com.codearena.entity.Problem;
import com.codearena.enums.Difficulty;
import com.codearena.exception.DuplicateResourceException;
import com.codearena.exception.ResourceNotFoundException;
import com.codearena.repository.ProblemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProblemService Unit Tests")
class ProblemServiceTest {

    @Mock
    private ProblemRepository problemRepository;

    @InjectMocks
    private ProblemService problemService;

    private Problem sampleProblem;
    private ProblemRequest validRequest;

    @BeforeEach
    void setUp() {
        sampleProblem = Problem.builder()
                .id(1L)
                .title("Two Sum")
                .descriptionMd("Given an array of integers, return indices...")
                .difficulty(Difficulty.EASY)
                .tags("[\"arrays\",\"hashmap\"]")
                .createdAt(LocalDateTime.now())
                .testCases(new ArrayList<>())
                .submissions(new ArrayList<>())
                .build();

        validRequest = ProblemRequest.builder()
                .title("Two Sum")
                .descriptionMd("Given an array of integers, return indices...")
                .difficulty(Difficulty.EASY)
                .tags("[\"arrays\",\"hashmap\"]")
                .build();
    }

    // ─────────────────────────────── CREATE ───────────────────────────────

    @Test
    @DisplayName("create() — valid request → returns ProblemResponse with correct fields")
    void create_validRequest_returnsMappedResponse() {
        when(problemRepository.existsByTitleIgnoreCase("Two Sum")).thenReturn(false);
        when(problemRepository.save(any(Problem.class))).thenReturn(sampleProblem);

        ProblemResponse response = problemService.create(validRequest);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getTitle()).isEqualTo("Two Sum");
        assertThat(response.getDifficulty()).isEqualTo(Difficulty.EASY);
        verify(problemRepository).save(any(Problem.class));
    }

    @Test
    @DisplayName("create() — duplicate title (same case) → throws DuplicateResourceException")
    void create_duplicateTitle_throwsDuplicateResourceException() {
        when(problemRepository.existsByTitleIgnoreCase("Two Sum")).thenReturn(true);

        assertThatThrownBy(() -> problemService.create(validRequest))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Two Sum");

        verify(problemRepository, never()).save(any());
    }

    @Test
    @DisplayName("create() — duplicate title (different case) → throws DuplicateResourceException")
    void create_duplicateTitleDifferentCase_throwsDuplicateResourceException() {
        ProblemRequest upperCaseRequest = ProblemRequest.builder()
                .title("TWO SUM")
                .descriptionMd("desc")
                .difficulty(Difficulty.EASY)
                .build();
        when(problemRepository.existsByTitleIgnoreCase("TWO SUM")).thenReturn(true);

        assertThatThrownBy(() -> problemService.create(upperCaseRequest))
                .isInstanceOf(DuplicateResourceException.class);
    }

    // ──────────────────────────────── GET ────────────────────────────────

    @Test
    @DisplayName("getById() — existing ID → returns ProblemResponse")
    void getById_existingId_returnsResponse() {
        when(problemRepository.findById(1L)).thenReturn(Optional.of(sampleProblem));

        ProblemResponse response = problemService.getById(1L);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getTitle()).isEqualTo("Two Sum");
    }

    @Test
    @DisplayName("getById() — non-existing ID → throws ResourceNotFoundException")
    void getById_notFound_throwsResourceNotFoundException() {
        when(problemRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> problemService.getById(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("getAll() — paginated → returns page of responses")
    void getAll_paginated_returnsPage() {
        PageRequest pageable = PageRequest.of(0, 10);
        Page<Problem> page = new PageImpl<>(List.of(sampleProblem));
        when(problemRepository.findAll(pageable)).thenReturn(page);

        Page<ProblemResponse> result = problemService.getAll(pageable);

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getTitle()).isEqualTo("Two Sum");
    }

    @Test
    @DisplayName("getByDifficulty() — EASY → returns only EASY problems")
    void getByDifficulty_easy_returnsEasyProblems() {
        PageRequest pageable = PageRequest.of(0, 10);
        Page<Problem> page = new PageImpl<>(List.of(sampleProblem));
        when(problemRepository.findByDifficulty(Difficulty.EASY, pageable)).thenReturn(page);

        Page<ProblemResponse> result = problemService.getByDifficulty(Difficulty.EASY, pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getDifficulty()).isEqualTo(Difficulty.EASY);
    }

    // ─────────────────────────────── UPDATE ───────────────────────────────

    @Test
    @DisplayName("update() — valid changes, same title → updates in place")
    void update_sameTitleChange_updatesSuccessfully() {
        when(problemRepository.findById(1L)).thenReturn(Optional.of(sampleProblem));

        ProblemRequest updateRequest = ProblemRequest.builder()
                .title("Two Sum")          // same title — no duplicate check
                .descriptionMd("Updated description.")
                .difficulty(Difficulty.MEDIUM)
                .tags("[\"dp\"]")
                .build();

        ProblemResponse response = problemService.update(1L, updateRequest);

        assertThat(response.getDescription()).isEqualTo("Updated description.");
        assertThat(response.getDifficulty()).isEqualTo(Difficulty.MEDIUM);
    }

    @Test
    @DisplayName("update() — new title, no conflict → updates title")
    void update_newTitleNoConflict_updatesTitle() {
        when(problemRepository.findById(1L)).thenReturn(Optional.of(sampleProblem));
        when(problemRepository.existsByTitleIgnoreCase("Three Sum")).thenReturn(false);

        ProblemRequest updateRequest = ProblemRequest.builder()
                .title("Three Sum")
                .descriptionMd("desc")
                .difficulty(Difficulty.HARD)
                .build();

        ProblemResponse response = problemService.update(1L, updateRequest);

        assertThat(response.getTitle()).isEqualTo("Three Sum");
    }

    @Test
    @DisplayName("update() — new title conflicts with existing problem → throws DuplicateResourceException")
    void update_newTitleConflict_throwsDuplicateResourceException() {
        when(problemRepository.findById(1L)).thenReturn(Optional.of(sampleProblem));
        when(problemRepository.existsByTitleIgnoreCase("Three Sum")).thenReturn(true);

        ProblemRequest conflictRequest = ProblemRequest.builder()
                .title("Three Sum")
                .descriptionMd("desc")
                .difficulty(Difficulty.HARD)
                .build();

        assertThatThrownBy(() -> problemService.update(1L, conflictRequest))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Three Sum");
    }

    @Test
    @DisplayName("update() — problem not found → throws ResourceNotFoundException")
    void update_notFound_throwsResourceNotFoundException() {
        when(problemRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> problemService.update(999L, validRequest))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ─────────────────────────────── DELETE ───────────────────────────────

    @Test
    @DisplayName("delete() — existing problem → calls repository.delete")
    void delete_existingProblem_callsRepositoryDelete() {
        when(problemRepository.findById(1L)).thenReturn(Optional.of(sampleProblem));

        problemService.delete(1L);

        verify(problemRepository).delete(sampleProblem);
    }

    @Test
    @DisplayName("delete() — non-existing problem → throws ResourceNotFoundException")
    void delete_notFound_throwsResourceNotFoundException() {
        when(problemRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> problemService.delete(999L))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(problemRepository, never()).delete(any());
    }
}
