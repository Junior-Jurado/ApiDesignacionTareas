const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app); // logger winston CloudWatch
const morgan = require('morgan'); //loger http
const logger = require('./utils/logger');
const cors = require('cors');
const passport = require('passport');
const initDb = require("./config/config")

/*
* RUTAS
*/
const users = require('./routes/userRoutes');
const projects = require('./routes/projectRoutes');
const userHistories = require('./routes/userHistoryRoutes')
const tasks = require('./routes/taskRoutes');

const port  = process.env.PORT || 3000;

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

app.disable('x-powered-by');

app.set('port', port);

// Llamando a las rutas
users(app);
projects(app);
userHistories(app);
tasks(app);


// Inicializar base de datos
(async () => {
	try {
		const db = await initDb();
		const result = await db.any("SELECT NOW()");
		console.log("DB Connected: ", result);
	} catch (err) {
		console.error("Error connecting to DB", err);
	}
}) ();

server.listen(port, () => {
	logger.info(`Server listening on port ${port}`); 
})

// ERROR HANDLER
app.use((err, req, res, next) => {
    console.log(err);
    res.status(err.status || 500).send(err.stack);
});

module.exports = {
    app: app,
    server: server
};