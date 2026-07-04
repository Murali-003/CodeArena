package com.codearena.controller;

import com.codearena.dto.leaderboard.LeaderboardResponse;
import com.codearena.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping
    public ResponseEntity<List<LeaderboardResponse>> getLeaderboard() {
        return ResponseEntity.ok(leaderboardService.getLeaderboard());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<LeaderboardResponse> getForUser(@PathVariable Long userId) {
        return ResponseEntity.ok(leaderboardService.getForUser(userId));
    }
}
