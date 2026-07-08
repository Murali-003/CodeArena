package com.codearena.exception;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    // Convenience factory so service code reads cleanly, e.g.:
    // problemRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("Problem", id));
    public static ResourceNotFoundException of(String entity, Object id) {
        return new ResourceNotFoundException(entity + " not found with id: " + id);
    }
}