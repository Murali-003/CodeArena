package com.codearena.service.executor;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import org.springframework.stereotype.Service;

import com.codearena.enums.Language;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class DockerCodeExecutor implements CodeExecutor {

    @Override
    public CodeExecutionResult execute(CodeExecutionRequest request) throws Exception {
        if (request == null || request.sourceCode() == null || request.sourceCode().isBlank()) {
            throw new IllegalArgumentException("sourceCode is required");
        }
        if (request.language() == null || request.language().isBlank()) {
            throw new IllegalArgumentException("language is required");
        }

        Language language = Language.valueOf(request.language().trim().toUpperCase());
        Path tempDir = Files.createTempDirectory("codearena-");
        try {
            // Write source and stdin to host tempdir (used only for docker cp into the
            // container after 'docker create'; the container itself reads from /workspace
            // which is backed by a tmpfs mount so host files are never exposed at runtime).
            Path sourceFile = tempDir.resolve(getSourceFileName(language));
            Path stdinFile  = tempDir.resolve("input.txt");
            Files.writeString(sourceFile, request.sourceCode(), StandardCharsets.UTF_8);
            Files.writeString(stdinFile,  request.stdin() == null ? "" : request.stdin(), StandardCharsets.UTF_8);

            // Base64-encode source and stdin so we can inject them via --env and write
            // them inside the container's tmpfs /workspace without needing docker cp.
            String sourceB64 = Base64.getEncoder().encodeToString(
                    request.sourceCode().getBytes(StandardCharsets.UTF_8));
            String stdinB64 = Base64.getEncoder().encodeToString(
                    (request.stdin() == null ? "" : request.stdin()).getBytes(StandardCharsets.UTF_8));

            String containerName = "codearena-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
            String image = switch (language) {
                case JAVA   -> "eclipse-temurin:21-jdk";
                case PYTHON -> "python:3.11";
                case CPP    -> "gcc:latest";
            };

            // ── shared isolation flags — /workspace is a tmpfs; files are injected
            //    via env vars (SOURCE_B64 / STDIN_B64) decoded at container startup ──
            List<String> isolationFlags = List.of(
                    "--network=none",
                    "--read-only",
                    // uid=65534,gid=65534 are the numeric IDs for 'nobody' in the container
                    // images so that --user=nobody can write into the tmpfs at startup.
                    "--tmpfs", "/workspace:rw,size=256m,uid=65534,gid=65534",
                    "--cap-drop=ALL",
                    "--memory=512m",
                    "--memory-swap=512m",
                    "--user=nobody",
                    "--env", "SOURCE_B64=" + sourceB64,
                    "--env", "STDIN_B64=" + stdinB64
            );

            // ── COMPILE step ─────────────────────────────────────────────────────────
            String compileContainerName = containerName + "-compile";
            String compileStdout = "";
            String compileStderr = "";

            // docker create
            List<String> createCompileCmd = buildCreateCommand(
                    compileContainerName, isolationFlags, image, buildCompileCommand(language));
            Process createCompile = new ProcessBuilder(createCompileCmd).redirectErrorStream(false).start();
            boolean createCompileFinished = createCompile.waitFor(120, TimeUnit.SECONDS);
            if (!createCompileFinished || createCompile.exitValue() != 0) {
                createCompile.destroyForcibly();
                String err = readStream(createCompile.getErrorStream());
                log.warn("Failed to create compile container {}: {}", compileContainerName, err);
               return new CodeExecutionResult(
    "COMPILATION_ERROR",
    "",
    "",
    "Failed to create container: " + err,
    createCompileFinished ? createCompile.exitValue() : -1,
    0,
    0,
    compileContainerName
);
            }

            // docker start -a  (files are decoded from env vars by the entrypoint sh script)
            Process compileProcess = new ProcessBuilder("docker", "start", "-a", compileContainerName)
                    .redirectErrorStream(false).start();
            boolean compileFinished = compileProcess.waitFor(5, TimeUnit.SECONDS);
            if (compileFinished) {
                compileStdout = readStream(compileProcess.getInputStream());
                compileStderr = readStream(compileProcess.getErrorStream());
            }

            // always remove compile container
            removeContainer(compileContainerName);

            if (!compileFinished) {
                compileProcess.destroyForcibly();
                log.warn("Compilation timed out for container {}. Exit code: 124", compileContainerName);
return new CodeExecutionResult(
        "TIME_LIMIT_EXCEEDED",
        "",
        "",
        "Compilation timed out",
        124,
        5000,
        0,
        compileContainerName
);            }
            if (compileProcess.exitValue() != 0) {
                log.warn("Compilation failed for container {}. Exit code: {}, stderr: {}, stdout: {}",
                        compileContainerName, compileProcess.exitValue(), compileStderr, compileStdout);
return new CodeExecutionResult(
        "COMPILATION_ERROR",
        "",
        "",
        compileStderr.isBlank() ? compileStdout : compileStderr,
        compileProcess.exitValue(),
        0,
        0,
        compileContainerName
);
            }
            // ── RUN step ──────────────────────────────────────────────────────────────
            String runContainerName = containerName + "-run";

            // docker create
            List<String> createRunCmd = buildCreateCommand(
                    runContainerName, isolationFlags, image, buildRunCommand(language));
            Process createRun = new ProcessBuilder(createRunCmd).redirectErrorStream(false).start();
            boolean createRunFinished = createRun.waitFor(120, TimeUnit.SECONDS);
            if (!createRunFinished || createRun.exitValue() != 0) {
                createRun.destroyForcibly();
                String err = readStream(createRun.getErrorStream());
                log.warn("Failed to create run container {}: {}", runContainerName, err);
                return new CodeExecutionResult(
        "RUNTIME_ERROR",
        "",
        "",
        "Failed to create container: " + err,
        createRunFinished ? createRun.exitValue() : -1,
        0,
        0,
        runContainerName
);
            }

            // docker start -a  (env vars decoded inside container)
            long startedAt = System.nanoTime();
            Process runProcess = new ProcessBuilder("docker", "start", "-a", runContainerName)
                    .redirectErrorStream(false).start();
            boolean runFinished = runProcess.waitFor(5, TimeUnit.SECONDS);
            String stdout = "";
            String stderr = "";
            if (runFinished) {
                stdout = readStream(runProcess.getInputStream());
                stderr = readStream(runProcess.getErrorStream());
            }
            long elapsedMs = TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - startedAt);

            // check OOM before removing (inspect while container still exists)
            boolean oomKilled = runFinished && isOomKilled(runContainerName);

            // always remove run container
            removeContainer(runContainerName);

            if (!runFinished) {
                runProcess.destroyForcibly();
return new CodeExecutionResult(
        "TIME_LIMIT_EXCEEDED",
        "",
        "",
        "Execution timed out",
        124,
        elapsedMs,
        0,
        runContainerName
);
}

int exitCode = runProcess.exitValue();

if (exitCode == 137 || oomKilled) {
    log.warn("Memory limit exceeded for container {}. Exit code: {}, stdout: {}, stderr: {}",
            runContainerName, exitCode, stdout, stderr);

    return new CodeExecutionResult(
            "MEMORY_LIMIT_EXCEEDED",
            stdout,          // actualOutput
            "",              // expectedOutput (executor doesn't know it)
            stderr,          // errorMessage
            exitCode,
            elapsedMs,
            512000,
            runContainerName
    );
}

return new CodeExecutionResult(
        "SUCCESS",
        stdout,          // actualOutput
        "",              // expectedOutput (executor doesn't know it)
        stderr,          // errorMessage
        exitCode,
        elapsedMs,
        0,
        runContainerName
);}
finally {
            deleteRecursively(tempDir);
        }
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    /**
     * Builds a {@code docker create} command list with all isolation flags,
     * the target image, and the entrypoint command.
     */
    private List<String> buildCreateCommand(String name, List<String> isolationFlags,
                                             String image, List<String> entrypoint) {
        List<String> cmd = new ArrayList<>();
        cmd.add("docker");
        cmd.add("create");
        cmd.add("--name");
        cmd.add(name);
        cmd.addAll(isolationFlags);
        cmd.add("-w");
        cmd.add("/workspace");
        cmd.add(image);
        cmd.addAll(entrypoint);
        return cmd;
    }

    /**
     * Removes a container (equivalent to {@code docker rm -f}).
     * Errors are silently swallowed — best-effort cleanup only.
     */
    private void removeContainer(String containerName) {
        try {
            Process rm = new ProcessBuilder("docker", "rm", "-f", containerName)
                    .redirectErrorStream(true).start();
            rm.waitFor(10, TimeUnit.SECONDS);
        } catch (Exception ignored) {
        }
    }

    /**
     * Compile command run inside the container.
     *
     * <p>Files are decoded from {@code SOURCE_B64} / {@code STDIN_B64} environment variables
     * and written to {@code /workspace} (which is backed by a tmpfs mount) before compilation.
     *
     * <p>Python: uses {@code compile()} built-in — no {@code .pyc} write needed.
     * Java / C++: standard compiler invocations into {@code /workspace}.
     */
    private List<String> buildCompileCommand(Language language) {
        // NOTE: We use 'python -m py_compile' rather than
        // 'python -c "compile(open(...).read(), ...)"' because the Java →
        // Windows ProcessBuilder → docker → sh quoting chain strips the double
        // quotes inside the -c argument on Docker Desktop for Windows, causing a
        // Python SyntaxError.  With /workspace backed by tmpfs the .pyc write is
        // fully in-memory and costs nothing — semantically identical to compile().
        String decodeAndCompile = switch (language) {
            case JAVA   -> "echo \"$SOURCE_B64\" | base64 -d > /workspace/Main.java && "
                         + "echo \"$STDIN_B64\"  | base64 -d > /workspace/input.txt  && "
                         + "javac -d /workspace /workspace/Main.java";
            case PYTHON -> "echo \"$SOURCE_B64\" | base64 -d > /workspace/main.py && "
                         + "python -m py_compile /workspace/main.py";
            case CPP    -> "echo \"$SOURCE_B64\" | base64 -d > /workspace/main.cpp && "
                         + "echo \"$STDIN_B64\"  | base64 -d > /workspace/input.txt  && "
                         + "g++ -std=c++17 -O2 -o /workspace/a.out /workspace/main.cpp";
        };
        return List.of("sh", "-c", decodeAndCompile);
    }

    /**
     * Run command executed inside the container.
     *
     * <p>Because compile and run use <em>separate</em> tmpfs containers, compiled
     * artifacts cannot be transferred between them. Java and C++ therefore
     * compile-and-run in a single shell invocation so the artifact stays
     * within the same container lifetime.
     *
     * <p>Files are decoded from env vars (same as the compile step) so the
     * run container is fully self-contained and requires no bind mounts.
     */
    private List<String> buildRunCommand(Language language) {
        String decodeAndRun = switch (language) {
            case JAVA   -> "echo \"$SOURCE_B64\" | base64 -d > /workspace/Main.java && "
                         + "echo \"$STDIN_B64\"  | base64 -d > /workspace/input.txt  && "
                         + "javac -d /workspace /workspace/Main.java && "
                         + "java -cp /workspace Main < /workspace/input.txt";
            case PYTHON -> "echo \"$SOURCE_B64\" | base64 -d > /workspace/main.py && "
                         + "echo \"$STDIN_B64\"  | base64 -d > /workspace/input.txt  && "
                         + "python /workspace/main.py < /workspace/input.txt";
            case CPP    -> "echo \"$SOURCE_B64\" | base64 -d > /workspace/main.cpp && "
                         + "echo \"$STDIN_B64\"  | base64 -d > /workspace/input.txt  && "
                         + "g++ -std=c++17 -O2 -o /workspace/a.out /workspace/main.cpp && "
                         + "/workspace/a.out < /workspace/input.txt";
        };
        return List.of("sh", "-c", decodeAndRun);
    }

    private String getSourceFileName(Language language) {
        return switch (language) {
            case JAVA   -> "Main.java";
            case PYTHON -> "main.py";
            case CPP    -> "main.cpp";
        };
    }

    private String readStream(java.io.InputStream stream) throws IOException {
        return new String(stream.readAllBytes(), StandardCharsets.UTF_8);
    }

    private boolean isOomKilled(String containerName) throws IOException, InterruptedException {
        Process inspect = new ProcessBuilder("docker", "inspect",
                "--format={{.State.OOMKilled}}", containerName).start();
        String output = readStream(inspect.getInputStream());
        inspect.waitFor(5, TimeUnit.SECONDS);
        return inspect.exitValue() == 0 && "true".equalsIgnoreCase(output.trim());
    }

    private void killContainer(String containerName) throws IOException, InterruptedException {
        Process kill = new ProcessBuilder("docker", "kill", containerName).start();
        kill.waitFor(5, TimeUnit.SECONDS);
    }

    private void deleteRecursively(Path tempDir) {
        try {
            Files.walk(tempDir)
                    .sorted((a, b) -> b.compareTo(a))
                    .forEach(path -> {
                        try {
                            Files.deleteIfExists(path);
                        } catch (IOException ignored) {
                        }
                    });
        } catch (IOException ignored) {
        }
    }
}
