-- ============================================================
--  SEED DATA (runs after schema is created by Hibernate)
--  Password for all accounts: Admin@123
-- ============================================================

INSERT INTO role (role_name)
SELECT 'ADMIN' WHERE NOT EXISTS (SELECT 1 FROM role WHERE role_name = 'ADMIN');

INSERT INTO role (role_name)
SELECT 'FACULTY' WHERE NOT EXISTS (SELECT 1 FROM role WHERE role_name = 'FACULTY');

INSERT INTO role (role_name)
SELECT 'STUDENT' WHERE NOT EXISTS (SELECT 1 FROM role WHERE role_name = 'STUDENT');

INSERT INTO users (name, email, password_hash, role_id)
SELECT 'Super Admin', 'admin@testbank.com',
       '$2a$10$Dow7yP6dKT4JYXC.7RqHxOFhX.YD/YqP0c6SNQn5r88XxfbBNFWBi',
       (SELECT role_id FROM role WHERE role_name = 'ADMIN')
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@testbank.com');

INSERT INTO users (name, email, password_hash, role_id)
SELECT 'Dr. Faculty', 'faculty@testbank.com',
       '$2a$10$Dow7yP6dKT4JYXC.7RqHxOFhX.YD/YqP0c6SNQn5r88XxfbBNFWBi',
       (SELECT role_id FROM role WHERE role_name = 'FACULTY')
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'faculty@testbank.com');

INSERT INTO users (name, email, password_hash, role_id)
SELECT 'Alice Student', 'alice@testbank.com',
       '$2a$10$Dow7yP6dKT4JYXC.7RqHxOFhX.YD/YqP0c6SNQn5r88XxfbBNFWBi',
       (SELECT role_id FROM role WHERE role_name = 'STUDENT')
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'alice@testbank.com');

INSERT INTO category (category_name)
SELECT unnest(ARRAY['Mathematics','Science','English','History','Programming'])
WHERE NOT EXISTS (SELECT 1 FROM category LIMIT 1);

INSERT INTO question (question_text, option_a, option_b, option_c, option_d,
                      correct_option, difficulty, default_marks, category_id, created_by)
SELECT 'What is 2 + 2?', '3', '4', '5', '6', 'B', 'easy', 1,
       (SELECT category_id FROM category WHERE category_name = 'Mathematics'),
       (SELECT user_id FROM users WHERE email = 'admin@testbank.com')
WHERE NOT EXISTS (SELECT 1 FROM question WHERE question_text = 'What is 2 + 2?');

INSERT INTO question (question_text, option_a, option_b, option_c, option_d,
                      correct_option, difficulty, default_marks, category_id, created_by)
SELECT 'What is the speed of light?', '3x10^6 m/s', '3x10^8 m/s', '3x10^10 m/s', '3x10^4 m/s',
       'B', 'medium', 2,
       (SELECT category_id FROM category WHERE category_name = 'Science'),
       (SELECT user_id FROM users WHERE email = 'faculty@testbank.com')
WHERE NOT EXISTS (SELECT 1 FROM question WHERE question_text = 'What is the speed of light?');

INSERT INTO question (question_text, option_a, option_b, option_c, option_d,
                      correct_option, difficulty, default_marks, category_id, created_by)
SELECT 'Which data structure uses FIFO ordering?', 'Stack', 'Queue', 'Tree', 'Graph',
       'B', 'easy', 1,
       (SELECT category_id FROM category WHERE category_name = 'Programming'),
       (SELECT user_id FROM users WHERE email = 'faculty@testbank.com')
WHERE NOT EXISTS (SELECT 1 FROM question WHERE question_text = 'Which data structure uses FIFO ordering?');

INSERT INTO question (question_text, option_a, option_b, option_c, option_d,
                      correct_option, difficulty, default_marks, category_id, created_by)
SELECT 'What does the Pythagorean theorem state?', 'a+b=c', 'a2+b2=c2', 'a2-b2=c', '2a+b=c',
       'B', 'medium', 2,
       (SELECT category_id FROM category WHERE category_name = 'Mathematics'),
       (SELECT user_id FROM users WHERE email = 'faculty@testbank.com')
WHERE NOT EXISTS (SELECT 1 FROM question WHERE question_text = 'What does the Pythagorean theorem state?');

INSERT INTO question (question_text, option_a, option_b, option_c, option_d,
                      correct_option, difficulty, default_marks, category_id, created_by)
SELECT 'Who wrote Romeo and Juliet?', 'Charles Dickens', 'Mark Twain',
       'William Shakespeare', 'Jane Austen',
       'C', 'easy', 1,
       (SELECT category_id FROM category WHERE category_name = 'English'),
       (SELECT user_id FROM users WHERE email = 'admin@testbank.com')
WHERE NOT EXISTS (SELECT 1 FROM question WHERE question_text = 'Who wrote Romeo and Juliet?');
