CREATE TABLE test_cases (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    problem_id BIGINT NOT NULL,

    input_data LONGTEXT NOT NULL,

    expected_output LONGTEXT NOT NULL,

    is_hidden BOOLEAN DEFAULT TRUE,

    time_limit_override INT,

    FOREIGN KEY (problem_id)
        REFERENCES problems(id)
        ON DELETE CASCADE

);