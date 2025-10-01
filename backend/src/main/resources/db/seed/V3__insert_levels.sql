INSERT INTO level (level_id, title, required_exp) VALUES
(1, 'Newbie', 0),
(2, 'Explorer', 100),
(3, 'Advanced Contributor', 300),
(4, 'Developer', 600),
(5, 'Active Developer', 1000),
(6, 'Maintainer', 1500),
(7, 'Senior Maintainer', 2100),
(8, 'Senior Maintainer', 2800),
(9, 'OSS Leader', 3600),
(10, 'OSS Doctor', 4500)
ON DUPLICATE KEY UPDATE level_id = level_id;