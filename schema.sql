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
    username NVARCHAR(50) NOT NULL UNIQUE,
    chickens_killed INT NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);
GO

-- Create an index on chickens_killed for faster leaderboard queries
CREATE INDEX idx_chickens_killed ON Highscores(chickens_killed DESC);
GO

-- Sample data for testing (optional - comment out if not needed)
INSERT INTO Highscores (username, chickens_killed) VALUES
('ChickenSlayer99', 15420),
('BokBokDestroyer', 12350),
('FeatherHunter', 11200),
('CluckConqueror', 9870),
('EggTerminator', 8940);
GO
