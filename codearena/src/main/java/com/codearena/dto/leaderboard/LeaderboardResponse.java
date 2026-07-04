package com.codearena.dto.leaderboard;

import com.codearena.entity.LeaderboardEntry;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaderboardResponse {

    private Long userId;
    private String username;
    private Integer problemsSolved;
    private BigDecimal accuracy;
    private Integer rankPosition;

    public static LeaderboardResponse fromEntity(LeaderboardEntry entry) {
        return LeaderboardResponse.builder()
                .userId(entry.getUser() != null ? entry.getUser().getId() : null)
                .username(entry.getUser() != null ? entry.getUser().getUsername() : null)
                .problemsSolved(entry.getProblemsSolved())
                .accuracy(entry.getAccuracy())
                .rankPosition(entry.getRankPosition())
                .build();
    }
}
