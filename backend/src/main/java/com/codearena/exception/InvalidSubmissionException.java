package com.codearena.exception;

// Thrown for domain-rule violations that aren't simple field validation,
// e.g. rate-limit exceeded, unsupported language, empty test case set on a problem.
public class InvalidSubmissionException extends RuntimeException {

    public InvalidSubmissionException(String message) {
        super(message);
    }
}