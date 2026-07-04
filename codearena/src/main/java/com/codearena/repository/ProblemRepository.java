package com.codearena.repository;

import com.codearena.entity.Problem;
import com.codearena.enums.Difficulty;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProblemRepository extends JpaRepository<Problem, Long> {

    Optional<Problem> findByTitleIgnoreCase(String title);

    boolean existsByTitleIgnoreCase(String title);

    Page<Problem> findByDifficulty(Difficulty difficulty, Pageable pageable);

    List<Problem> findByTagsContainingIgnoreCase(String tag);
}