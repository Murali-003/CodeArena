package com.codearena.repository;

import com.codearena.entity.TestCase;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TestCaseRepository extends JpaRepository<TestCase, Long> {

    List<TestCase> findByProblemId(Long problemId);

    List<TestCase> findByProblemIdAndIsHiddenFalse(Long problemId);

    long countByProblemId(Long problemId);
}