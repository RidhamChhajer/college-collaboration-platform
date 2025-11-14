    /*CREATE TABLE students (
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
    */
    CREATE DATABASE college_collab_platform;
    USE college_collab_platform;
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


    -- Create users table for authentication
    CREATE TABLE users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255),
        google_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Link students to users
    ALTER TABLE students ADD COLUMN user_id INT,
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;



    select * from users;
