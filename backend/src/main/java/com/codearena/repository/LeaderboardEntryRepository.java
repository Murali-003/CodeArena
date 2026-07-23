package com.codearena.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.codearena.entity.LeaderboardEntry;

public interface LeaderboardEntryRepository extends JpaRepository<LeaderboardEntry, Long> {

    Optional<LeaderboardEntry> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    List<LeaderboardEntry> findAllByOrderByProblemsSolvedDescAccuracyDesc();

    List<LeaderboardEntry> findAllByOrderByRankAsc();

    List<LeaderboardEntry> findAllByOrderByWeightedScoreDescAccuracyDesc();
}
