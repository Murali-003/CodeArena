package com.codearena.dto.leaderboard;

public interface LeaderboardStats {

    Long getUserId();

    String getUsername();

    Long getProblemsSolved();

    Double getAccuracy();
}