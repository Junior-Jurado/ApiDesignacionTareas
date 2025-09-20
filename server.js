const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const morgan = require('morgan');
const logger = require('./utils/logger');
const cors = require('cors');
const passport = require('passport');
const initDb = require("./config/config");

// =======================
// MODELOS
// =======================
const User = require('./models/user');
const Project = require('./models/project');
const Task = require('./models/task');
const UserHistory = require('./models/user_history'); // si existe

// =======================
// RUTAS
// =======================
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const userHistoryRoutes = require('./routes/userHistoryRoutes');
const taskRoutes = require('./routes/taskRoutes');

const port = process.env.PORT || 3000;

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

app.disable('x-powered-by');

app.set('port', port);

// =======================
// Inicializar DB y modelos
// =======================
(async () => {
	try {
		const db = await initDb();
		console.log("DB Connected");

		// Inyectar DB en los modelos
		User.setDb(db);
		Project.setDb(db);
		Task.setDb(db);
		UserHistory.setDb(db);

		// Una vez inyectada la DB, registramos rutas
		userRoutes(app);
		projectRoutes(app);
		userHistoryRoutes(app);
		taskRoutes(app);

	} catch (err) {
		console.error("Error connecting to DB", err);
		console.error(err.stack);
	}
})();

// =======================
// Iniciar servidor
// =======================
server.listen(port, '0.0.0.0', () => {
	logger.info(`Server listening on port ${port}`);
});

// =======================
// ERROR HANDLER
// =======================
app.use((err, req, res, next) => {
	console.error(err);
	res.status(err.status || 500).send(err.stack);
});

module.exports = { app, server };
