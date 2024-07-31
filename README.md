To run the project, execute:

```bash
cd backend
npm install
npm start
```

This will start an Express server running on port 9099.

In case of system incompatibility, use the Dockerfile.

For the frontend application, execute:

```bash
cd frontend
npm install
ng serve --open
```

Details:

    - The schemas have been modified in the array definitions. Unless corrected, the items property is expected to receive an object rather than an array.
