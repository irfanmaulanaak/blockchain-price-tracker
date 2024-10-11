# Blockchain Price Tracker

This project is a Blockchain Price Tracker built with NestJS, using the Moralis API to fetch and keep track prices of Ethereum and Polygon. This project is for technical interview assignments.

## Prerequisites

- Node.js (v14 or later)
- pnpm
- Docker and Docker Compose (for running with Docker)

## Environment Setup

Create a `.env` file based on .env.example and change with your environment variables.

## Running the Application

### Without Docker

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the application:
   ```bash
   pnpm run start:dev
   ```

The application will be available at `http://localhost:3000`.

### With Docker

1. Build and start the containers:
   ```bash
   docker-compose up --build
   ```

This command will build the Docker image and start the containers for both the application and the database.

The application will be available at `http://localhost:3000`.

To stop the containers, use:
```bash
docker-compose down
```

## API Documentation

Once the application is running, you can access the Swagger at:

```
http://localhost:3000/api
```

## Features

1. Automatically saves the Price of Ethereum and Polygon every 5 minutes
2. Sends an email alert when the price of a chain increases by more than 3% compared to its price one hour ago
3. API for returning the prices of each hour (within 24 hours)
4. API for setting price alerts
5. API for getting swap rates between ETH and BTC

## Testing

Run the tests using:

```bash
pnpm run test
```

## License

This project is [MIT licensed](LICENSE).