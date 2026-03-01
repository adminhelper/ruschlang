package com.ruschlang.backend.domain.post.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ApproveRequest(
    @NotBlank(message = "상태값은 필수입니다")
    @Pattern(regexp = "^(approved|rejected)$", message = "상태값은 approved 또는 rejected만 가능합니다")
    String status
) {
}
