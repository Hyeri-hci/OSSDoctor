CREATE TABLE IF NOT EXISTS badge (
    idx BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    category ENUM(
                     'COMMIT',
                     'COMMIT_STREAK',
                     'PR_EXTERNAL',
                     'PR_MERGE',
                     'ISSUE_CREATE',
                     'ISSUE_SOLVE',
                     'CODE_REVIEW',
                     'STAR',
                     'FORK',
                     'WATCH',
                     'UPCYCLE'
                 ) NOT NULL,
    level INT NOT NULL DEFAULT 1,
    requirement VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS level (
    level_id BIGINT NOT NULL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    required_exp INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
