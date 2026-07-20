package com.codearena.controller;

import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithAnonymousUser;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.transaction.annotation.Transactional;

import com.codearena.dto.problem.ProblemRequest;
import com.codearena.entity.User;
import com.codearena.enums.Difficulty;
import com.codearena.enums.Role;
import com.codearena.repository.ProblemRepository;
import com.codearena.repository.UserRepository;
import com.codearena.security.CustomUserDetails;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Integration tests for ProblemController RBAC and validation.
 *
 * Uses @SpringBootTest (full context) + MockMvc + an in-memory H2 database
 * (via the "test" Spring profile). Each test runs inside a transaction that
 * is rolled back at the end so tests remain independent.
 *
 * NOTE: If the CI environment does not have a test-profile DB configured, the
 * tests will auto-skip due to datasource unavailability — that is the expected
 * fallback behaviour. Configure src/test/resources/application-test.properties
 * with an H2 URL to enable them in CI.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("ProblemController Integration Tests")
class ProblemControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProblemRepository problemRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private CustomUserDetails adminDetails;
    private CustomUserDetails userDetails;

    private ProblemRequest validRequest;

    @BeforeEach
    void setUp() {
        // Create admin user
        User admin = User.builder()
                .username("test_admin")
                .email("test_admin@codearena.test")
                .passwordHash(passwordEncoder.encode("adminpass"))
                .role(Role.ADMIN)
                .createdAt(LocalDateTime.now())
                .build();
        admin = userRepository.save(admin);
        adminDetails = new CustomUserDetails(admin);

        // Create regular user
        User regularUser = User.builder()
                .username("test_user")
                .email("test_user@codearena.test")
                .passwordHash(passwordEncoder.encode("userpass"))
                .role(Role.USER)
                .createdAt(LocalDateTime.now())
                .build();
        regularUser = userRepository.save(regularUser);
        userDetails = new CustomUserDetails(regularUser);

        validRequest = ProblemRequest.builder()
                .title("Integration Test Problem")
                .descriptionMd("This is a test problem for integration testing.")
                .difficulty(Difficulty.EASY)
                .tags("[\"test\"]")
                .build();
    }

    // ─────────────────────────── PUBLIC GET ENDPOINTS ─────────────────────────

    @Test
    @DisplayName("GET /api/problems — authenticated user → 200 OK")
    void getAll_authenticatedUser_returns200() throws Exception {
        mockMvc.perform(get("/api/problems")
                        .with(user(userDetails))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
@DisplayName("GET /api/problems — unauthenticated → 401 Unauthorized")
@WithAnonymousUser
void getAll_unauthenticated_returns401() throws Exception {
    mockMvc.perform(get("/api/problems"))
            .andExpect(status().isUnauthorized());
}

    // ─────────────────────────── ADMIN CREATE ─────────────────────────────────

    @Test
    @DisplayName("POST /api/problems — admin with valid request → 201 Created")
    void create_adminValidRequest_returns201() throws Exception {
        mockMvc.perform(post("/api/problems")
                        .with(user(adminDetails))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Integration Test Problem"))
                .andExpect(jsonPath("$.difficulty").value("EASY"))
                .andExpect(jsonPath("$.id").isNumber());
    }

    @Test
    @DisplayName("POST /api/problems — regular user → 403 Forbidden")
    void create_regularUser_returns403() throws Exception {
        mockMvc.perform(post("/api/problems")
                        .with(user(userDetails))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isForbidden());
    }

@Test
@DisplayName("POST /api/problems — unauthenticated → 401 Unauthorized")
@WithAnonymousUser
void create_unauthenticated_returns401() throws Exception {

    mockMvc.perform(post("/api/problems")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(validRequest)))
            .andExpect(status().isUnauthorized());
}

    @Test
    @DisplayName("POST /api/problems — admin with missing title → 400 Bad Request")
    void create_missingTitle_returns400() throws Exception {
        ProblemRequest badRequest = ProblemRequest.builder()
                .title("")  // blank — @NotBlank should reject
                .descriptionMd("Some description")
                .difficulty(Difficulty.EASY)
                .build();

        mockMvc.perform(post("/api/problems")
                        .with(user(adminDetails))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"));
    }

    @Test
    @DisplayName("POST /api/problems — admin with missing description → 400 Bad Request")
    void create_missingDescription_returns400() throws Exception {
        ProblemRequest badRequest = ProblemRequest.builder()
                .title("Valid Title")
                .descriptionMd("")  // blank
                .difficulty(Difficulty.MEDIUM)
                .build();

        mockMvc.perform(post("/api/problems")
                        .with(user(adminDetails))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/problems — admin with missing difficulty → 400 Bad Request")
    void create_missingDifficulty_returns400() throws Exception {
        // Send JSON without difficulty field
        String json = "{\"title\":\"Test Problem\",\"descriptionMd\":\"desc\"}";

        mockMvc.perform(post("/api/problems")
                        .with(user(adminDetails))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/problems — duplicate title → 409 Conflict")
    void create_duplicateTitle_returns409() throws Exception {
        // First creation
        mockMvc.perform(post("/api/problems")
                        .with(user(adminDetails))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isCreated());

        // Second creation with same title
        mockMvc.perform(post("/api/problems")
                        .with(user(adminDetails))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isConflict());
    }

    // ─────────────────────────── ADMIN UPDATE ─────────────────────────────────

    @Test
    @DisplayName("PUT /api/problems/{id} — admin with valid update → 200 OK")
    void update_adminValidRequest_returns200() throws Exception {
        // First create the problem
        String createResult = mockMvc.perform(post("/api/problems")
                        .with(user(adminDetails))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long problemId = objectMapper.readTree(createResult).get("id").asLong();

        ProblemRequest updateRequest = ProblemRequest.builder()
                .title("Updated Problem Title")
                .descriptionMd("Updated description.")
                .difficulty(Difficulty.HARD)
                .build();

        mockMvc.perform(put("/api/problems/{id}", problemId)
                        .with(user(adminDetails))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Problem Title"))
                .andExpect(jsonPath("$.difficulty").value("HARD"));
    }

    @Test
    @DisplayName("PUT /api/problems/{id} — regular user → 403 Forbidden")
    void update_regularUser_returns403() throws Exception {
        mockMvc.perform(put("/api/problems/1")
                        .with(user(userDetails))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("PUT /api/problems/{id} — non-existing problem → 404 Not Found")
    void update_notFound_returns404() throws Exception {
        mockMvc.perform(put("/api/problems/99999")
                        .with(user(adminDetails))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isNotFound());
    }

    // ─────────────────────────── ADMIN DELETE ─────────────────────────────────

    @Test
    @DisplayName("DELETE /api/problems/{id} — admin → 204 No Content")
    void delete_admin_returns204() throws Exception {
        String createResult = mockMvc.perform(post("/api/problems")
                        .with(user(adminDetails))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long problemId = objectMapper.readTree(createResult).get("id").asLong();

        mockMvc.perform(delete("/api/problems/{id}", problemId)
                        .with(user(adminDetails)))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("DELETE /api/problems/{id} — regular user → 403 Forbidden")
    void delete_regularUser_returns403() throws Exception {
        mockMvc.perform(delete("/api/problems/1")
                        .with(user(userDetails)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("DELETE /api/problems/{id} — non-existing problem → 404 Not Found")
    void delete_notFound_returns404() throws Exception {
        mockMvc.perform(delete("/api/problems/99999")
                        .with(user(adminDetails)))
                .andExpect(status().isNotFound());
    }
}
