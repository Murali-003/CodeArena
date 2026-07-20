package com.codearena.service.executor;

public record CodeExecutionResult(

        String status,

        String actualOutput,

        String expectedOutput,

        String errorMessage,

        int exitCode,

        long executionTimeMs,

        long memoryUsedKb,

        String containerId

) {
}