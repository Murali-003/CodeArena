package com.codearena.controller;

import com.codearena.dto.execution.ExecutionRequest;
import com.codearena.service.executor.CodeExecutionRequest;
import com.codearena.service.executor.CodeExecutionResult;
import com.codearena.service.executor.CodeExecutor;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/execute")
@RequiredArgsConstructor
public class ExecutionController {

    private final CodeExecutor codeExecutor;

    @PostMapping
    public ResponseEntity<CodeExecutionResult> executeCode(@Valid @RequestBody ExecutionRequest request) throws Exception {
        CodeExecutionRequest execReq = new CodeExecutionRequest(
                request.getSourceCode(),
                request.getLanguage().name(),
                request.getCustomInput() == null ? "" : request.getCustomInput()
        );
        CodeExecutionResult result = codeExecutor.execute(execReq);
        return ResponseEntity.ok(result);
    }
}
