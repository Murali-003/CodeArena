package com.codearena.service.executor;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

@Tag("integration")
@EnabledIfSystemProperty(named = "docker.tests.enabled", matches = "true")
class DockerCodeExecutorIntegrationTest {

    private static CodeExecutor executor;

    @BeforeAll
    static void beforeAll() throws Exception {
        executor = new DockerCodeExecutor();
        assumeDockerAvailable();
        cleanupLeftoverContainers();
    }

    @AfterEach
    void afterEach() throws Exception {
        cleanupLeftoverContainers();
    }

    @Test
    void testValidCodeProducesCorrectOutput() throws Exception {
        CodeExecutionRequest request = new CodeExecutionRequest("print(\"hello\")\n", "python", "");
        long start = System.nanoTime();
        CodeExecutionResult result = executor.execute(request);
        long execTimeMs = TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - start);

        System.out.printf("VALID_CODE status=%s execTimeMs=%d pass=%s%n",
                result.status(), execTimeMs,
                result.status().equals("SUCCESS") && result.stdout().trim().equals("hello"));

        assertEquals("SUCCESS", result.status());
        assertEquals("hello", result.stdout().trim());
    }

    @Test
    void testInfiniteLoopTriggersTimeout() throws Exception {
        CodeExecutionRequest request = new CodeExecutionRequest("while True:\n    pass\n", "python", "");
        long start = System.nanoTime();
        CodeExecutionResult result = executor.execute(request);
        long execTimeMs = TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - start);

        System.out.printf("TIMEOUT status=%s execTimeMs=%d pass=%s%n",
                result.status(), execTimeMs,
                execTimeMs < 8000 && result.status().equals("TIME_LIMIT_EXCEEDED"));

        assertTrue(execTimeMs < 8000, "execution should finish before the 8s budget");
        assertEquals("TIME_LIMIT_EXCEEDED", result.status());
        assertTrue(containerIsGone(result.containerId()), "container should be removed after timeout");
    }

    @Test
    void testMemoryExceedingProgramTriggersOOM() throws Exception {
        CodeExecutionRequest request = new CodeExecutionRequest("data = []\nfor _ in range(700):\n    data.append(bytearray(1024 * 1024))\n", "python", "");
        long start = System.nanoTime();
        CodeExecutionResult result = executor.execute(request);
        long execTimeMs = TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - start);

        System.out.printf("OOM status=%s execTimeMs=%d pass=%s%n",
                result.status(), execTimeMs,
                result.status().equals("MEMORY_LIMIT_EXCEEDED") && execTimeMs < 5000);

        assertEquals("MEMORY_LIMIT_EXCEEDED", result.status());
        assertTrue(execTimeMs < 5000, "OOM should be detected before the timeout window");
    }

    @Test
    void testMaliciousSyscallIsBlocked() throws Exception {
        CodeExecutionRequest request = new CodeExecutionRequest(
                "import os\ntry:\n    with open('/root/hacked.txt', 'w') as f:\n        f.write('escaped')\n    print('WRITE_SUCCEEDED')\nexcept Exception as e:\n    print(f'WRITE_BLOCKED: {e}')\n",
                "python",
                "");
        long start = System.nanoTime();
        CodeExecutionResult result = executor.execute(request);
        long execTimeMs = TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - start);

        System.out.printf("MALICIOUS status=%s execTimeMs=%d pass=%s%n",
                result.status(), execTimeMs,
                result.stdout().contains("WRITE_BLOCKED"));

        assertEquals("SUCCESS", result.status());
        assertTrue(result.stdout().contains("WRITE_BLOCKED"), "the sandbox should block the write to the read-only filesystem");
    }

    private static void assumeDockerAvailable() {
        try {
            Process process = new ProcessBuilder("docker", "info").inheritIO().start();
            assumeTrue(process.waitFor(10, TimeUnit.SECONDS), "Docker is not available on this machine");
            assumeTrue(process.exitValue() == 0, "Docker daemon is not reachable");
        } catch (Exception ex) {
            assumeTrue(false, "Docker is not available: " + ex.getMessage());
        }
    }

    private static void cleanupLeftoverContainers() throws IOException, InterruptedException {
        Process process = new ProcessBuilder("docker", "container", "prune", "-f").inheritIO().start();
        process.waitFor(20, TimeUnit.SECONDS);
    }

    private boolean containerIsGone(String containerId) {
        if (containerId == null || containerId.isBlank()) {
            return true;
        }
        try {
            Process process = new ProcessBuilder("docker", "inspect", containerId).redirectErrorStream(true).start();
            String output = new String(process.getInputStream().readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
            process.waitFor(10, TimeUnit.SECONDS);
            return process.exitValue() != 0 || output.contains("No such object");
        } catch (Exception ex) {
            return true;
        }
    }
}
