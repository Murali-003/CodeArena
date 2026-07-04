package com.codearena.repository;

import com.codearena.entity.Submission;
import com.codearena.enums.SubmissionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    Page<Submission> findByUserIdOrderBySubmittedAtDesc(Long userId, Pageable pageable);

    List<Submission> findByUserIdAndProblemId(Long userId, Long problemId);

    // Backbone of the rate-limit check: 5 submissions per problem per minute per user
    @Query("SELECT COUNT(s) FROM Submission s " +
           "WHERE s.user.id = :userId AND s.problem.id = :problemId " +
           "AND s.submittedAt >= :since")
    long countRecentSubmissions(@Param("userId") Long userId,
                                 @Param("problemId") Long problemId,
                                 @Param("since") LocalDateTime since);

    long countByUserIdAndStatus(Long userId, SubmissionStatus status);
}