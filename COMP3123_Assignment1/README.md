# COMP3123 Assignment 1

A Node.js, Express and MongoDB backend for user accounts and employee management. Each user can only access employees they created.

## Links

- GitHub: https://github.com/Aminmamin/101604337_COMP3123_Assignment1
- Hosted API: https://101604337-comp-3123-assignment1.vercel.app
- Health check: https://101604337-comp-3123-assignment1.vercel.app/health

## Technologies

Node.js, Express, MongoDB Atlas, Mongoose, bcryptjs, JSON Web Tokens, express-validator, Helmet, express-rate-limit, Winston and Vercel.

## Project structure

The application is inside the COMP3123_Assignment1 folder.

- config: MongoDB connection
- controllers: signup, login and employee operations
- models: User and Employee schemas
- routes: Express API routes
- middleware: authentication and centralized error handling
- validators: request validation
- utils: application logger
- logs: generated local log files
- app.js: Express configuration and routes
- index.js: environment checks and server startup

## Local setup

Clone the repository and open the application folder:

```bash
git clone https://github.com/Aminmamin/101604337_COMP3123_Assignment1.git
cd 101604337_COMP3123_Assignment1/COMP3123_Assignment1
npm install
cp .env.example .env
```

Edit .env and set:

- PORT: local server port, normally 3000
- MONGODB_URI: MongoDB connection string
- JWT_SECRET: a random secret containing at least 32 bytes

Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Paste the generated value into JWT_SECRET in .env.

For MongoDB Atlas, create a database user and allow the application's network access. For local MongoDB, start MongoDB on port 27017.

The application uses the database comp3123_assignment1.

Start the application:

```bash
npm start
```

For automatic restarts during development:

```bash
npm run dev
```

Local base URL: http://localhost:3000

## API endpoints

| Method | Path | Success status |
|---|---|---|
| POST | /api/v1/user/signup | 201 |
| POST | /api/v1/user/login | 200 |
| GET | /api/v1/emp/employees | 200 |
| POST | /api/v1/emp/employees | 201 |
| GET | /api/v1/emp/employees/:eid | 200 |
| PUT | /api/v1/emp/employees/:eid | 200 |
| DELETE | /api/v1/emp/employees?eid=EMPLOYEE_ID | 204 |
| GET | /health | 200 when the database connects |

### Signup

```json
{
  "username": "user_a",
  "email": "user_a@example.com",
  "password": "TestPass123!"
}
```

Usernames and emails must be unique. Passwords require at least eight characters, an uppercase letter, a lowercase letter and a number. Password input is limited to 72 bytes.

### Login

Login accepts either username and password or email and password.

```json
{
  "username": "user_a",
  "password": "TestPass123!"
}
```

Successful login returns a JWT that expires after one hour.

### Employee requests

All employee endpoints require:

```text
Authorization: Bearer YOUR_LOGIN_TOKEN
```

Example employee body:

```json
{
  "first_name": "Alex",
  "last_name": "Smith",
  "email": "alex.smith@example.com",
  "position": "Developer",
  "salary": 60000,
  "date_of_joining": "2026-10-12",
  "department": "IT"
}
```

PUT requests must include all seven employee fields. Salary must be a positive JSON number. Dates must use a valid ISO format.

## Authentication and ownership

Passwords are hashed using bcrypt with a cost of 12 before storage. Password hashes are excluded from normal queries and are never included in signup or login responses.

Authentication middleware verifies the JWT and finds the user identified by its subject. Missing, invalid and expired tokens return 401.

Each employee has a user field referencing its owner. The owner comes from the authenticated user, not from the request body.

Employee lists are filtered by owner. Individual employee operations check ownership and include the owner in their database queries. Access to another user's employee returns 403.

## Security and validation

Helmet adds HTTP security headers, and the application disables the X-Powered-By header.

express-validator checks required fields, input types, lengths, email formats, salaries, dates and employee IDs. Unexpected employee fields are rejected. JSON bodies are limited to 20 KB.

Configuration secrets are stored in environment variables. The actual .env file and node_modules are excluded from Git. .env.example contains safe placeholders.

## Rate limiting

Rate limiting restricts repeated requests from an IP address.

- General /api traffic: 200 requests per 15 minutes.
- Signup and login combined: 20 requests per 15 minutes.

Exceeding either limit returns 429 with a JSON error message.

The current limiters use an in-memory store. On Vercel, counts are specific to an instance and may reset when an instance restarts; they are not shared across all instances.

To test locally, repeatedly send an authentication request until the API returns 429. Wait for the window to reset before continuing authentication tests.

## Errors

Errors use JSON responses with success set to false and a useful message.

- 400: invalid input, malformed JSON or invalid ID
- 401: invalid credentials or missing, invalid or expired token
- 403: another user's employee
- 404: missing employee or unsupported route
- 409: duplicate username or email
- 413: request body too large
- 429: rate limit exceeded
- 500: unexpected server error
- 503: database connection failure during the health check

DELETE success returns 204 with no response body.

## Logging

Winston writes local logs to logs/app.log and the console. Logs include timestamps, request methods, paths, statuses and authentication, authorization and operation events.

Request bodies, passwords, full tokens, JWT secrets and database connection strings are not logged.

Generated logs are excluded from Git. On Vercel, file logs use /tmp/assignment1-logs and are temporary. Console logs are available in Vercel runtime logs.

## Health check

GET /health attempts a database connection before returning:

```json
{
  "success": true,
  "message": "API is running",
  "database": "connected"
}
```

If the connection fails, it returns 503 and reports the database as disconnected.

## Testing

Use Postman with either the local or hosted base URL.

Test signup, login, employee CRUD, validation errors, duplicate users, invalid credentials, missing and invalid tokens, invalid IDs, missing employees and rate limiting.

For ownership testing, use two accounts. Create employees for both accounts and check that each account only sees its own employees. Attempts to retrieve, update or delete the other account's employees must return 403.

The exported Postman collection is supplied with the submission. Screenshots document the major steps according to the instructor's clarification.

## Sample accounts for marking

These are disposable assignment accounts, not personal credentials.

| Username | Email | Password |
|---|---|---|
| user_a | user_a@example.com | TestPass123! |
| user_b | user_b@example.com | TestPass123! |

## Vercel deployment

Import the GitHub repository and set Root Directory to COMP3123_Assignment1.

Set MONGODB_URI and JWT_SECRET as Vercel environment variables. Configure Atlas network access for the deployment.

Deploy and verify /health and the API endpoints. Environment variable changes require a new deployment.