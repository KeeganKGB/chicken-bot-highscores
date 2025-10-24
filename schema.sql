-- Database schema for Chicken Kicker Highscores
-- Run this script on your Microsoft SQL Server to create the required database and table

-- Create the database
CREATE DATABASE ChickenBotDB;
GO

USE ChickenBotDB;
GO

-- Create the Highscores table
CREATE TABLE Highscores (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(50) NOT NULL,
    account_name NVARCHAR(50) NOT NULL,
    chickens_killed INT NOT NULL DEFAULT 0,
    starting_level INT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT UQ_account_name UNIQUE (account_name)
);
GO

-- Create indexes for faster queries
CREATE INDEX idx_chickens_killed ON Highscores(chickens_killed DESC);
CREATE INDEX idx_username ON Highscores(username);
GO

-- Sample data for testing (optional - comment out if not needed)
INSERT INTO Highscores (username, account_name, chickens_killed, starting_level) VALUES
('Player1', 'ChickenSlayer99', 15420, 3),
('Player1', 'AltAccount1', 5000, 10),
('Player2', 'BokBokDestroyer', 12350, 15),
('Player3', 'FeatherHunter', 11200, 8),
('Player4', 'CluckConqueror', 9870, 20);
GO
