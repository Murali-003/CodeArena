CREATE TABLE submissions (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT NOT NULL,

    problem_id BIGINT NOT NULL,

    language ENUM('JAVA', 'PYTHON', 'CPP') NOT NULL,

    status ENUM(
        'PENDING',
        'RUNNING',
        'ACCEPTED',
        'WRONG_ANSWER',
        'COMPILATION_ERROR',
        'TIME_LIMIT_EXCEEDED',
        'MEMORY_LIMIT_EXCEEDED',
        'RUNTIME_ERROR'
    ) NOT NULL DEFAULT 'PENDING',

    source_code LONGTEXT NOT NULL,

    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (problem_id)
        REFERENCES problems(id)
        ON DELETE CASCADE

);