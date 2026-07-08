package com.codearena.dto.submission;

import com.codearena.enums.Language;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// The user_id is deliberately NOT part of this DTO — it should always come
// from the authenticated principal (JWT), never from client input.
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmissionRequest {

    @NotNull(message = "Problem id is required")
    private Long problemId;

    @NotNull(message = "Language is required")
    private Language language;

    @NotBlank(message = "Source code cannot be empty")
    private String sourceCode;
}
