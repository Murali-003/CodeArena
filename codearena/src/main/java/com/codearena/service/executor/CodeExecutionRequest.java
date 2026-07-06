package com.codearena.service.executor;

public record CodeExecutionRequest(String sourceCode, String language, String stdin) {
}
