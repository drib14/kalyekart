# E-Commerce Store

This is a full-stack e-commerce application.

## Running the Application

To run the application, you will need to start both the main server and the order updater worker.

### 1. Start the Main Server

```bash
npm start
```

This will start the main Express server.

### 2. Start the Order Updater Worker

In a separate terminal, run the following command:

```bash
npm run worker
```

This will start the background worker that is responsible for automatically updating order statuses. For a production environment, it is recommended to run this worker as a persistent process using a process manager like PM2 or in a separate container.

### 3. Note on Barangay Data

The list of barangays for Cebu City is currently hardcoded in `frontend/src/data/cebuBarangays.js`. For a production application, this should be replaced with a more scalable solution, such as fetching this data from a dedicated API for Philippine geographic data.
