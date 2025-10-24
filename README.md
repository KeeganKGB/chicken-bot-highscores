# Chicken Kicker Highscores

A Node.js web server for tracking and displaying highscores for your RuneScape chicken-killing bot. Designed to be hosted at keegan.bot.

## Features

- Real-time highscores leaderboard
- RESTful API for bot integration
- Microsoft SQL Server database integration
- Automatic ranking system
- Responsive web interface
- Auto-refresh every 30 seconds

## Prerequisites

- Node.js (v14 or higher)
- Microsoft SQL Server (Local or Azure)
- npm or yarn

## Installation

1. Clone or navigate to the project directory:
```bash
cd chicken-bot-highscores
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Edit `.env` with your database credentials:
```env
DB_SERVER=localhost
DB_USER=sa
DB_PASSWORD=YourPassword123!
DB_DATABASE=ChickenBotDB
DB_PORT=1433
PORT=3000
```

5. Set up the database by running the SQL schema:
```bash
# Connect to your SQL Server and run:
sqlcmd -S localhost -U sa -P YourPassword123! -i schema.sql
```

Or manually execute the `schema.sql` file using SQL Server Management Studio or Azure Data Studio.

## Running the Server

### Development Mode
```bash
node server.js
```

The server will start on `http://localhost:3000`

### Production Mode (with PM2)
```bash
npm install -g pm2
pm2 start server.js --name chicken-bot
pm2 save
pm2 startup
```

## API Endpoints

### GET /api/highscores
Get all highscores (default limit: 100)

**Query Parameters:**
- `limit` (optional): Number of results to return

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 1,
      "username": "ChickenSlayer99",
      "chickens_killed": 10000,
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-15T12:00:00.000Z"
    }
  ]
}
```

### GET /api/user/:username
Get a specific user's stats and rank

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "ChickenSlayer99",
    "chickens_killed": 10000,
    "rank": 1,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-15T12:00:00.000Z"
  }
}
```

### POST /api/update
Update or create a user's score

**Request Body:**
```json
{
  "username": "NewPlayer",
  "chickensKilled": 1500
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "updated": true,
    "username": "NewPlayer"
  }
}
```

## Bot Integration Example

Here's how to update scores from your RuneScape bot:

```javascript
const axios = require('axios');

async function updateHighscore(username, chickensKilled) {
    try {
        const response = await axios.post('http://localhost:3000/api/update', {
            username,
            chickensKilled
        });
        console.log('Score updated:', response.data);
    } catch (error) {
        console.error('Failed to update score:', error.message);
    }
}

// Example usage
updateHighscore('MyBot', 2500);
```

## Database Schema

The `Highscores` table contains:
- `id`: Primary key (auto-increment)
- `username`: Unique username (NVARCHAR(50))
- `chickens_killed`: Number of chickens killed (INT)
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

## Deployment to Production

### Option 1: Traditional Hosting
1. Set up a VPS (DigitalOcean, Linode, AWS EC2)
2. Install Node.js and SQL Server
3. Configure your domain (keegan.bot) to point to your server
4. Use nginx as a reverse proxy
5. Use PM2 to keep the app running

### Option 2: Azure
1. Deploy SQL Server to Azure SQL Database
2. Deploy the Node.js app to Azure App Service
3. Configure environment variables in Azure
4. Point keegan.bot to your Azure App Service

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_SERVER` | SQL Server hostname | localhost |
| `DB_USER` | SQL Server username | sa |
| `DB_PASSWORD` | SQL Server password | - |
| `DB_DATABASE` | Database name | ChickenBotDB |
| `DB_PORT` | SQL Server port | 1433 |
| `PORT` | Web server port | 3000 |

## Troubleshooting

### Connection Issues
- Verify SQL Server is running: `docker ps` or check Windows Services
- Test connection: `sqlcmd -S localhost -U sa -P YourPassword123!`
- Check firewall settings for port 1433

### Database Errors
- Ensure the database exists: Run `schema.sql`
- Verify credentials in `.env` file
- Check SQL Server allows TCP/IP connections

## License

MIT

## Author

Built for keegan.bot chicken killing operations.
