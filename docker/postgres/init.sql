-- Initialize the articles database
-- This script runs when the PostgreSQL container starts for the first time

-- Create additional schemas if needed
-- CREATE SCHEMA IF NOT EXISTS articles_schema;

-- Create any initial tables or data here
-- Example:
-- CREATE TABLE IF NOT EXISTS articles (
--     id SERIAL PRIMARY KEY,
--     title VARCHAR(255) NOT NULL,
--     content TEXT,
--     author VARCHAR(100),
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- Insert sample data if needed
-- INSERT INTO articles (title, content, author) VALUES 
-- ('Welcome Article', 'This is a sample article content.', 'Admin'),
-- ('Getting Started', 'Learn how to use this application.', 'Admin');

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE articles TO articles_user;
