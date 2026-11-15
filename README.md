# Museum Database Project - COSC 3380

Team #3: Avery Hong, Ruben Reyna, Valeriia Krokhotina, Kensey Celis, Shrinik Madisetty

**Website:** https://coogmuseum-bxhea8dad0dwhhhb.westus3-01.azurewebsites.net

## Technology Stack
- Frontend: React (Vite)
- Backend: Node.js
- Database: MySQL

## Files in the Google Drive folder
- `3380-museum.zip` - code
- `museum_dump.sql` - SQL dump with data
- `project_document.pdf` - data types, user roles, triggers, queries and reports
- `README.md` - this file

## How to run the project

**1. Download and unzip**
Download `3380-museum.zip` and `museum_dump.sql` from the Google Drive folder and unzip the zip file.

**2. Import the database**
In MySQL Workbench: **Server -> Data Import -> Import from Self-Contained File**, select `museum_dump.sql` and click **Start Import**.

**3. Create `backend/.env`** with your MySQL login:

    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=yourMySQLPassword
    DB_NAME=museum
    DB_PORT=3306

**4. Install packages**

    cd 3380-museum/backend
    npm install
    cd ../frontend
    npm install

**5. Start** (two terminals)

    cd 3380-museum/backend
    npm start

    cd 3380-museum/frontend
    npm run dev

Open http://localhost:5173

## Demo Logins:

Username: admin@demo.test 
Password: admin123 

Username: staff@demo.test 
Password: staff123  

Username: customer@demo.test 
Password: customer123
