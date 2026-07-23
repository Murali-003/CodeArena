package com.codearena.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.codearena.entity.Submission;
import com.codearena.enums.Language;
import com.codearena.enums.SubmissionStatus;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    Page<Submission> findByUserIdOrderBySubmittedAtDesc(Long userId, Pageable pageable);

    List<Submission> findByUserIdAndProblemId(Long userId, Long problemId);

    @Query("SELECT COUNT(s) FROM Submission s " +
           "WHERE s.user.id = :userId AND s.problem.id = :problemId " +
           "AND s.submittedAt >= :since")
    long countRecentSubmissions(@Param("userId") Long userId,
                                 @Param("problemId") Long problemId,
                                 @Param("since") LocalDateTime since);

    long countByUserIdAndStatus(Long userId, SubmissionStatus status);

    @Query("SELECT COUNT(DISTINCT s.problem.id) FROM Submission s " +
           "WHERE s.user.id = :userId AND s.status = :status")
    long countDistinctProblemIdByUserIdAndStatus(@Param("userId") Long userId, @Param("status") SubmissionStatus status);

    long countByUserId(Long userId);

    List<Submission> findByUserIdOrderBySubmittedAtAsc(Long userId);
    @Query("""
SELECT COUNT(s)
FROM Submission s
WHERE s.user.id = :userId
AND s.problem.id = :problemId
AND s.status <> com.codearena.enums.SubmissionStatus.ACCEPTED
""")
long countFailedAttempts(
        @Param("userId") Long userId,
        @Param("problemId") Long problemId);
@Query("""
SELECT
u.id as userId,
u.username as username,
COUNT(DISTINCT CASE WHEN s.status = com.codearena.enums.SubmissionStatus.ACCEPTED THEN s.problem.id END) as problemsSolved,
(
COUNT(CASE WHEN s.status = com.codearena.enums.SubmissionStatus.ACCEPTED THEN 1 END)
*100.0
/
COUNT(s)
) as accuracy

FROM Submission s
JOIN s.user u

WHERE s.submittedAt >= :startOfWeek

GROUP BY u.id,u.username

ORDER BY
problemsSolved DESC,
accuracy DESC
""")
List<com.codearena.dto.leaderboard.LeaderboardStats> findWeeklyLeaderboard(
        @Param("startOfWeek") LocalDateTime startOfWeek);

        @Query("""
SELECT
u.id as userId,
u.username as username,
COUNT(DISTINCT CASE WHEN s.status = com.codearena.enums.SubmissionStatus.ACCEPTED THEN s.problem.id END) as problemsSolved,
(
COUNT(CASE WHEN s.status = com.codearena.enums.SubmissionStatus.ACCEPTED THEN 1 END)
*100.0
/
COUNT(s)
) as accuracy

FROM Submission s
JOIN s.user u

WHERE s.language = :language

GROUP BY u.id,u.username

ORDER BY
problemsSolved DESC,
accuracy DESC
""")
List<com.codearena.dto.leaderboard.LeaderboardStats> findLanguageLeaderboard(
        @Param("language") Language language);


@Query("""
SELECT
COALESCE(
SUM(
CASE p.difficulty
WHEN com.codearena.enums.Difficulty.EASY THEN 10
WHEN com.codearena.enums.Difficulty.MEDIUM THEN 20
WHEN com.codearena.enums.Difficulty.HARD THEN 30
ELSE 0
END
),
0
)
FROM Submission s
JOIN s.problem p
WHERE s.user.id = :userId
AND s.status = com.codearena.enums.SubmissionStatus.ACCEPTED
""")
Integer calculateWeightedScore(
        @Param("userId") Long userId);        
}