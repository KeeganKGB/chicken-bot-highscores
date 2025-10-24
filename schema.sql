-- Database schema for Chicken Kicker Highscores
-- Run this script on your Microsoft SQL Server to create the required table

CREATE DATABASE ChickenKickerDB;
GO

USE ChickenKickerDB;
GO

CREATE TABLE Highscores (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(50) NOT NULL UNIQUE,
    chickens_killed INT NOT NULL DEFAULT 0,
    total_xp BIGINT NOT NULL DEFAULT 0,
    level INT NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);
GO

-- Create an index on chickens_killed for faster leaderboard queries
CREATE INDEX idx_chickens_killed ON Highscores(chickens_killed DESC);
GO

-- Sample data for testing
INSERT INTO Highscores (username, chickens_killed, total_xp, level) VALUES
('Zezima', 10000, 500000, 99),
('Woox', 8500, 425000, 95),
('ChickenSlayer', 7200, 360000, 92),
('BotMaster', 5000, 250000, 85),
('Noob123', 1000, 50000, 60);
GO
