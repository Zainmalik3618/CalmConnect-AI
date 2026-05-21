require('dotenv').config();
const app = require('./app');
const initDb = require('./services/initDb');

const PORT = process.env.PORT || 3001;

// Initialize DB
initDb();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
