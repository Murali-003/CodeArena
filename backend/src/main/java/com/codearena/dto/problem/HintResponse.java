package com.codearena.dto.problem;

import com.codearena.entity.ProblemHint;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HintResponse {

    private Long id;
    private Integer displayOrder;
    private String hintText;
    private Integer unlockAfterAttempts;

    public static HintResponse fromEntity(ProblemHint hint) {
        return HintResponse.builder()
                .id(hint.getId())
                .displayOrder(hint.getDisplayOrder())
                .hintText(hint.getHintText())
                .unlockAfterAttempts(hint.getUnlockAfterAttempts())
                .build();
    }
}