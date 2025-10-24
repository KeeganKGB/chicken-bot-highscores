const sql = require('mssql');
require('dotenv').config();

const config = {
    server: process.env.DB_SERVER || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT) || 1433,
    options: {
        encrypt: false, // Set to true if using Azure
        trustServerCertificate: true, // For local development
        enableArithAbort: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

let pool = null;
let useMockData = false;

// Mock data for testing when database is not available
const mockHighscores = [
    { id: 1, username: 'ChickenSlayer99', chickens_killed: 15420, created_at: new Date('2024-01-15'), updated_at: new Date('2024-12-20') },
    { id: 2, username: 'BokBokDestroyer', chickens_killed: 12350, created_at: new Date('2024-02-20'), updated_at: new Date('2024-12-19') },
    { id: 3, username: 'FeatherHunter', chickens_killed: 11200, created_at: new Date('2024-03-10'), updated_at: new Date('2024-12-18') },
    { id: 4, username: 'CluckConqueror', chickens_killed: 9870, created_at: new Date('2024-01-25'), updated_at: new Date('2024-12-17') },
    { id: 5, username: 'EggTerminator', chickens_killed: 8940, created_at: new Date('2024-04-05'), updated_at: new Date('2024-12-16') },
    { id: 6, username: 'WingWarrior', chickens_killed: 7650, created_at: new Date('2024-02-14'), updated_at: new Date('2024-12-15') },
    { id: 7, username: 'PeckPunisher', chickens_killed: 6780, created_at: new Date('2024-05-12'), updated_at: new Date('2024-12-14') },
    { id: 8, username: 'RoosterRuiner', chickens_killed: 5920, created_at: new Date('2024-03-22'), updated_at: new Date('2024-12-13') },
    { id: 9, username: 'HenHavoc', chickens_killed: 5340, created_at: new Date('2024-06-08'), updated_at: new Date('2024-12-12') },
    { id: 10, username: 'PoultrySlayer', chickens_killed: 4890, created_at: new Date('2024-04-18'), updated_at: new Date('2024-12-11') },
    { id: 11, username: 'BirdBane', chickens_killed: 4320, created_at: new Date('2024-07-03'), updated_at: new Date('2024-12-10') },
    { id: 12, username: 'CombSlayer', chickens_killed: 3850, created_at: new Date('2024-05-25'), updated_at: new Date('2024-12-09') },
    { id: 13, username: 'DrumstickDoom', chickens_killed: 3420, created_at: new Date('2024-08-14'), updated_at: new Date('2024-12-08') },
    { id: 14, username: 'ChickChaser', chickens_killed: 3010, created_at: new Date('2024-06-30'), updated_at: new Date('2024-12-07') },
    { id: 15, username: 'BeakBreaker', chickens_killed: 2680, created_at: new Date('2024-09-05'), updated_at: new Date('2024-12-06') }
];

async function getConnection() {
    try {
        if (!pool) {
            pool = await sql.connect(config);
            console.log('Connected to SQL Server');
            useMockData = false;
        }
        return pool;
    } catch (err) {
        console.error('Database connection failed:', err);
        console.warn('Using mock data for testing');
        useMockData = true;
        throw err;
    }
}

async function getHighscores(limit = 100) {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('limit', sql.Int, limit)
            .query(`
                WITH RankedAccounts AS (
                    SELECT
                        username,
                        account_name,
                        chickens_killed,
                        created_at,
                        updated_at,
                        ROW_NUMBER() OVER (PARTITION BY username ORDER BY chickens_killed DESC) as rn
                    FROM Highscores
                )
                SELECT TOP (@limit)
                    username,
                    account_name,
                    chickens_killed,
                    created_at,
                    updated_at
                FROM RankedAccounts
                WHERE rn = 1
                ORDER BY chickens_killed DESC
            `);
        return result.recordset;
    } catch (err) {
        console.error('Error fetching highscores:', err);
        if (useMockData) {
            console.log('Returning mock highscores data');
            return mockHighscores.slice(0, limit);
        }
        throw err;
    }
}

async function updateScore(username, accountName, chickensKilled, startingLevel = null) {
    try {
        const pool = await getConnection();

        // Check if account exists
        const checkAccount = await pool.request()
            .input('accountName', sql.NVarChar, accountName)
            .query('SELECT id, chickens_killed FROM Highscores WHERE account_name = @accountName');

        if (checkAccount.recordset.length > 0) {
            // Update existing account - ADD to existing total
            const result = await pool.request()
                .input('accountName', sql.NVarChar, accountName)
                .input('chickensKilled', sql.Int, chickensKilled)
                .query(`
                    UPDATE Highscores
                    SET chickens_killed = chickens_killed + @chickensKilled,
                        updated_at = GETDATE()
                    WHERE account_name = @accountName
                `);
            return { updated: true, username, accountName };
        } else {
            // Insert new account
            const result = await pool.request()
                .input('username', sql.NVarChar, username)
                .input('accountName', sql.NVarChar, accountName)
                .input('chickensKilled', sql.Int, chickensKilled)
                .input('startingLevel', sql.Int, startingLevel)
                .query(`
                    INSERT INTO Highscores (username, account_name, chickens_killed, starting_level)
                    VALUES (@username, @accountName, @chickensKilled, @startingLevel)
                `);
            return { created: true, username, accountName };
        }
    } catch (err) {
        console.error('Error updating score:', err);
        if (useMockData) {
            console.log('Mock mode: Simulating score update for', username);
            return { updated: true, username, mock: true };
        }
        throw err;
    }
}

async function getUserRank(username) {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .query(`
                SELECT
                    u.*,
                    (SELECT COUNT(*) + 1 FROM Highscores WHERE chickens_killed > u.chickens_killed) as rank
                FROM Highscores u
                WHERE u.username = @username
            `);
        return result.recordset[0];
    } catch (err) {
        console.error('Error fetching user rank:', err);
        if (useMockData) {
            console.log('Mock mode: Searching for user', username);
            const userIndex = mockHighscores.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
            if (userIndex !== -1) {
                return { ...mockHighscores[userIndex], rank: userIndex + 1 };
            }
            return null;
        }
        throw err;
    }
}

module.exports = {
    getConnection,
    getHighscores,
    updateScore,
    getUserRank
};
