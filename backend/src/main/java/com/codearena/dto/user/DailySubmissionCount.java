package com.codearena.dto.user;

import java.time.LocalDate;

public interface DailySubmissionCount {

    LocalDate getSubmissionDate();

    Long getSubmissionCount();

}