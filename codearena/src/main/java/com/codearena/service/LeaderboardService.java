package com.codearena.service;

import com.codearena.dto.leaderboard.LeaderboardResponse;
import com.codearena.entity.LeaderboardEntry;
import com.codearena.entity.User;
import com.codearena.exception.ResourceNotFoundException;
import com.codearena.repository.LeaderboardEntryRepository;
import com.codearena.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class LeaderboardService {

    private final LeaderboardEntryRepository leaderboardEntryRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<LeaderboardResponse> getLeaderboard() {
        return leaderboardEntryRepository.findAllByOrderByProblemsSolvedDescAccuracyDesc().stream()
                .map(LeaderboardResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public LeaderboardResponse getForUser(Long userId) {
        LeaderboardEntry entry = leaderboardEntryRepository.findByUserId(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("LeaderboardEntry for user", userId));
        return LeaderboardResponse.fromEntity(entry);
    }

    // Called after a submission is marked ACCEPTED, to keep aggregate stats current.
    // acceptedCount/totalCount come from the caller's own query against submissions.
    public void recalculate(Long userId, int problemsSolved, long acceptedCount, long totalCount) {
        LeaderboardEntry entry = leaderboardEntryRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> ResourceNotFoundException.of("User", userId));
                    return LeaderboardEntry.builder().user(user).build();
                });

        entry.setProblemsSolved(problemsSolved);

        BigDecimal accuracy = totalCount == 0
                ? BigDecimal.ZERO
                : BigDecimal.valueOf(acceptedCount)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(totalCount), 2, RoundingMode.HALF_UP);
        entry.setAccuracy(accuracy);

        leaderboardEntryRepository.save(entry);
        recomputeRanks();
    }

    // Simple full recompute; fine at this data scale, revisit if the user base grows large
    private void recomputeRanks() {
        List<LeaderboardEntry> ranked =
                leaderboardEntryRepository.findAllByOrderByProblemsSolvedDescAccuracyDesc();
        int position = 1;
        for (LeaderboardEntry entry : ranked) {
            entry.setRankPosition(position++);
        }
    }
}
