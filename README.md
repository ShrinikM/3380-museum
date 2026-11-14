# Museum Database Project COSC3380

Team #3: Avery Hong, Ruben Reyna, Valeriia Krokhotina, Kensey Celis, Shrinik Madisetty

Live site: https://coogmuseum-bxhea8dad0dwhhhb.westus3-01.azurewebsites.net

## Tech Stack
- Frontend: React
- Backend: Node.js
- Database: MySQL (Azure)

## Files
- `backend/schema/<museum_dump.sql>` - SQL dump of the populated `museum` database with data
- `backend/` - Node.js server that connects to the database
- `frontend/` - React web application
- `<Project Document>` - description of data, user roles, triggers, queries and reports

## Database Setup
1. Open MySQL Workbench and import `<museum_dump.sql>` (Server -> Data Import -> Import from Self-Contained File). This creates the `museum` database on your own MySQL server.
2. In the `backend` folder, create a file named `.env` with the login details of your own MySQL server:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourPassword
DB_NAME=museum
DB_PORT=3306

## Setup
```bash
cd frontend
npm install
cd ../backend
npm install
```

## Run
Run the backend and the frontend in two separate terminals:
```bash
cd backend
npm start
cd frontend
npm run dev
```
Then open the link shown in the frontend terminal.

## Demo Logins:

Username: admin@demo.test 
Password: admin123 

Username: staff@demo.test 
Password: staff123  

Username: customer@demo.test 
Password: customer123 
