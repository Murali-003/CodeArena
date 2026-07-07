package com.codearena.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StreakResponse {

    private int currentStreak;
    private int longestStreak;
    private int totalActiveDays;
    private Map<String, Integer> dailyCounts;
}
