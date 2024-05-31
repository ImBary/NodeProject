CREATE DATABASE Node_DB;

-- Select the new database
USE Node_DB;

-- Create the users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    login VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    dateOfBirth DATE NOT NULL,
    Role ENUM('admin', 'user', 'guest') NOT NULL
);

-- Insert a new user
INSERT INTO users (login, password, dateOfBirth, Role)
VALUES ('Adam', '123', '2002-10-02', 'admin');