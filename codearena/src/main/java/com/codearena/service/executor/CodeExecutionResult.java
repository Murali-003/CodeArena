package com.codearena.service.executor;

public record CodeExecutionResult(
        String status,
        String stdout,
        String stderr,
        int exitCode,
        long execTimeMs,
        String containerId
) {
}
