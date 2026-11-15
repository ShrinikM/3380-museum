# Museum Database Project – COSC 3380

Team #3: Avery Hong, Ruben Reyna, Valeriia Krokhotina, Kensey Celis, Shrinik Madisetty

**Live site:** https://coogmuseum-bxhea8dad0dwhhhb.westus3-01.azurewebsites.net

## Tech Stack
- Frontend: React (Vite)
- Backend: Node.js
- Database: MySQL

## Files in the Google Drive folder
- `<3380-museum.zip>` - complete code base (frontend and backend)
- `museum_dump.sql` - SQL dump of the populated `museum` database (tables, data and triggers). The same file is also inside the project at `backend/schema/museum_dump.sql`
- `<project_document.pdf>` - data types, user roles, triggers, queries and reports
- `README.md` - this file

## What you need installed
- Node.js 18 or newer (includes npm): https://nodejs.org
- MySQL Server 8 and MySQL Workbench: https://dev.mysql.com/downloads/

## Step 1. Download the project
1. Open the Google Drive folder.
2. Download `<3380-museum.zip>` and `museum_dump.sql`.
3. Unzip `<3380-museum.zip>`. You will get a folder `3380-museum` with `backend` and `frontend` inside.

## Step 2. Create the database
1. Open MySQL Workbench and connect to your local MySQL server.
2. Go to **Server -> Data Import**.
3. Choose **Import from Self-Contained File** and select `museum_dump.sql`.
4. Click **Start Import**. This creates the `museum` database with all tables, data and triggers.
5. Click the refresh button in the **Schemas** panel. You should see `museum`.

## Step 3. Connect the backend to your database
In the `3380-museum/backend` folder, create a file named `.env` (no other name, no extension) with your own MySQL login:

    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=yourMySQLPassword
    DB_NAME=museum
    DB_PORT=3306

## Step 4. Install packages
Open a terminal in the `3380-museum` folder and run:

    cd backend
    npm install
    cd ../frontend
    npm install

## Step 5. Run the project
You need two terminals open at the same time.

Terminal 1 (backend):

    cd 3380-museum/backend
    npm start

Leave it running.

Terminal 2 (frontend):

    cd 3380-museum/frontend
    npm run dev

Open the link shown in the frontend terminal (usually http://localhost:5173).

## Demo Logins:

Username: admin@demo.test 
Password: admin123 

Username: staff@demo.test 
Password: staff123  

Username: customer@demo.test 
Password: customer123 
