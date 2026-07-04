package com.codearena.repository;

import com.codearena.entity.LeaderboardEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LeaderboardEntryRepository extends JpaRepository<LeaderboardEntry, Long> {

    Optional<LeaderboardEntry> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    // Drives the public leaderboard view: most problems solved first, ties broken by accuracy
    List<LeaderboardEntry> findAllByOrderByProblemsSolvedDescAccuracyDesc();

    List<LeaderboardEntry> findAllByOrderByRankPositionAsc();
}
