package com.codearena.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.codearena.entity.ProblemHint;

public interface ProblemHintRepository extends JpaRepository<ProblemHint, Long> {

    List<ProblemHint> findByProblemIdOrderByDisplayOrderAsc(Long problemId);

    void deleteByProblemId(Long problemId);
}