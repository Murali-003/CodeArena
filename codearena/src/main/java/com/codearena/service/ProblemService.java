package com.codearena.service;

import com.codearena.dto.problem.ProblemRequest;
import com.codearena.dto.problem.ProblemResponse;
import com.codearena.entity.Problem;
import com.codearena.enums.Difficulty;
import com.codearena.exception.DuplicateResourceException;
import com.codearena.exception.ResourceNotFoundException;
import com.codearena.repository.ProblemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ProblemService {

    private final ProblemRepository problemRepository;

    public ProblemResponse create(ProblemRequest request) {
        if (problemRepository.existsByTitleIgnoreCase(request.getTitle())) {
            throw new DuplicateResourceException(
                    "A problem titled '" + request.getTitle() + "' already exists");
        }
        Problem problem = Problem.builder()
                .title(request.getTitle())
                .descriptionMd(request.getDescriptionMd())
                .difficulty(request.getDifficulty())
                .tags(request.getTags())
                .build();
        return ProblemResponse.fromEntity(problemRepository.save(problem));
    }

    @Transactional(readOnly = true)
    public ProblemResponse getById(Long id) {
        return ProblemResponse.fromEntity(findEntityOrThrow(id));
    }

    @Transactional(readOnly = true)
    public Page<ProblemResponse> getByDifficulty(Difficulty difficulty, Pageable pageable) {
        return problemRepository.findByDifficulty(difficulty, pageable)
                .map(ProblemResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public Page<ProblemResponse> getAll(Pageable pageable) {
        return problemRepository.findAll(pageable).map(ProblemResponse::fromEntity);
    }

    public ProblemResponse update(Long id, ProblemRequest request) {
        Problem problem = findEntityOrThrow(id);

        // Only enforce uniqueness if the title is actually changing
        if (!problem.getTitle().equalsIgnoreCase(request.getTitle())
                && problemRepository.existsByTitleIgnoreCase(request.getTitle())) {
            throw new DuplicateResourceException(
                    "A problem titled '" + request.getTitle() + "' already exists");
        }

        problem.setTitle(request.getTitle());
        problem.setDescriptionMd(request.getDescriptionMd());
        problem.setDifficulty(request.getDifficulty());
        problem.setTags(request.getTags());
        return ProblemResponse.fromEntity(problem);
    }

    public void delete(Long id) {
        Problem problem = findEntityOrThrow(id);
        problemRepository.delete(problem);
    }

    // Package-visible so SubmissionService/TestCaseService can fetch the managed entity
    // (not just the DTO) without duplicating the not-found logic.
    @Transactional(readOnly = true)
    public Problem findEntityOrThrow(Long id) {
        return problemRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Problem", id));
    }
}
