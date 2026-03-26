# ToDo App

A ToDo app built with JavaScript and React that helps to manage our daily tasks, powered by an Express.js backend using Node.js with MongoDB and PostgreSQl as databases.

## 📝 Requirements

- <a href="https://nodejs.org/en" target="_blank">Node.js</a> installed on your computer.

## ⚙️ Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/Benonki/ToDo-app.git
   ```
2. Enter into Frontend:
    ```bash
    cd Frontend
     ```
3. Install dependencies:
   ```bash
   npm i
   ```
    - In case of any `high` vulnerabilities:
       ```bash
       npm audit fix
        ```
4. Enter into selected `Backend`:
   ```bash
   cd BackendMongo
    ```
    or
    ```bash
   cd BackendPostgreSQL
    ```
5. Install Server dependencies:
   ```bash
   npm i
   ```
6. Create `.env` file in selected `Backend`. Example values can be found in `.env.example`.
7. Select one of the following databases:
### - MongoDB Version
1. Install <a href="https://www.mongodb.com/try/download/community" target="_blank"> MongoDB </a>on your PC.
2. After installation you need to add `/bin` path to environment PATH variables, default path to `/bin` should be:
   ```bash
    C:\Program Files\MongoDB\Server\<version>\bin
    ```

### - PostgreSQL Version
1. Install  <a href="https://www.postgresql.org/download/" target="_blank"> PostgreSQL </a> on your PC.
2. Open console in project and type:
   ```bash
    npx prisma migrate deploy
    ```
   ```bash
   npx prisma generate
   ```
## 🚀 Running the App
1. Configure your Database connection in `.env` file
2. Open console nr 1 and get into selected `Backend`:
   ```bash
   cd BackendMongo
    ```
   or
    ```bash
   cd BackendPostgreSQL
    ```
3. Start Server (in console nr 1):
    - For MongoDB:
    ```bash
    node server.js
    ```
   - For PostgreSQL:
   ```bash
   npm run dev
   ```
4. Open console nr 2 and get into `/Frontend`:
   ```bash
   cd Frontend
   ```
5. Start App (in console nr 2):
   ```bash
   npm run dev
   ```
7. You can open App on http://localhost:5173/ on your PC.
