package com.codearena.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "leaderboard_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaderboardEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ToString.Exclude
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "problems_solved", nullable = false)
    @Builder.Default
    private Integer problemsSolved = 0;

    @Column(nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal accuracy = BigDecimal.ZERO;

    @Column(name = "rank_value")
    private Integer rank;

    public Integer getRankPosition() {
        return rank;
    }

    public void setRankPosition(Integer rankPosition) {
        this.rank = rankPosition;
    }
}
