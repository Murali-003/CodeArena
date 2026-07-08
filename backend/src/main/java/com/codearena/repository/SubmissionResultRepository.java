package com.codearena.repository;

import com.codearena.entity.SubmissionResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubmissionResultRepository extends JpaRepository<SubmissionResult, Long> {

    List<SubmissionResult> findBySubmissionId(Long submissionId);

    List<SubmissionResult> findBySubmissionIdAndPassedFalse(Long submissionId);

    long countBySubmissionIdAndPassedTrue(Long submissionId);

    long countBySubmissionId(Long submissionId);
}
