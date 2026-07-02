CREATE TABLE leaderboard_entries (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT NOT NULL UNIQUE,

    problems_solved INT NOT NULL DEFAULT 0,

    accuracy DECIMAL(5,2) NOT NULL DEFAULT 0.00,

    rank_position INT,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE

);