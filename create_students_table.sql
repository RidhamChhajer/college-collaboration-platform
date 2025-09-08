CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    roll_number VARCHAR(50) NOT NULL UNIQUE,
    branch VARCHAR(100),
    year VARCHAR(100),
    class VARCHAR(50),
    skills JSON,
    interests JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

