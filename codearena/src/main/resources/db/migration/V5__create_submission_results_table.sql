CREATE TABLE submission_results (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    submission_id BIGINT NOT NULL,

    test_case_id BIGINT NOT NULL,

    passed BOOLEAN NOT NULL,

    execution_time_ms INT NOT NULL,

    memory_used_kb INT NOT NULL,

    stdout LONGTEXT,

    stderr LONGTEXT,

    FOREIGN KEY (submission_id)
        REFERENCES submissions(id)
        ON DELETE CASCADE,

    FOREIGN KEY (test_case_id)
        REFERENCES test_cases(id)
        ON DELETE CASCADE

);