package com.codearena.service;

import com.codearena.dto.user.StreakResponse;
import com.codearena.entity.Submission;
import com.codearena.repository.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StreakService {

    private final SubmissionRepository submissionRepository;

    @Transactional(readOnly = true)
    public StreakResponse getUserStreak(Long userId) {
        List<Submission> submissions = submissionRepository.findByUserIdOrderBySubmittedAtAsc(userId);

        Map<String, Integer> dailyCounts = new TreeMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE;

        Set<LocalDate> activeDays = new HashSet<>();

        for (Submission sub : submissions) {
            LocalDate date = sub.getSubmittedAt().toLocalDate();
            activeDays.add(date);
            String dateString = date.format(formatter);
            dailyCounts.put(dateString, dailyCounts.getOrDefault(dateString, 0) + 1);
        }

        List<LocalDate> sortedActiveDays = new ArrayList<>(activeDays);
        Collections.sort(sortedActiveDays);

        int currentStreak = 0;
        int longestStreak = 0;
        int tempStreak = 0;
        LocalDate today = LocalDate.now();

        if (!sortedActiveDays.isEmpty()) {
            LocalDate prevDate = null;
            for (LocalDate date : sortedActiveDays) {
                if (prevDate == null) {
                    tempStreak = 1;
                } else {
                    if (date.minusDays(1).equals(prevDate)) {
                        tempStreak++;
                    } else {
                        tempStreak = 1; // reset streak
                    }
                }
                if (tempStreak > longestStreak) {
                    longestStreak = tempStreak;
                }
                prevDate = date;
            }

            // Calculate current streak
            if (sortedActiveDays.contains(today) || sortedActiveDays.contains(today.minusDays(1))) {
                LocalDate checkDate = sortedActiveDays.contains(today) ? today : today.minusDays(1);
                currentStreak = 1;
                while (sortedActiveDays.contains(checkDate.minusDays(currentStreak))) {
                    currentStreak++;
                }
            }
        }

        return StreakResponse.builder()
                .currentStreak(currentStreak)
                .longestStreak(longestStreak)
                .totalActiveDays(activeDays.size())
                .dailyCounts(dailyCounts)
                .build();
    }
}
