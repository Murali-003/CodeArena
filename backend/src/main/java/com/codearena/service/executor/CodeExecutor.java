package com.codearena.service.executor;

public interface CodeExecutor {
    CodeExecutionResult execute(CodeExecutionRequest request) throws Exception;
}
