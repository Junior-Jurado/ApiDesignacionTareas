const promise = require("bluebird")
const options = {
    promiseLib: promise,
    query: (e) =>{}
}
const https = require('https');
const AWS = require("aws-sdk");

const pgp = require('pg-promise')(options);
const types = pgp.pg.types;
types.setTypeParser(1114, (stringValue) => stringValue);

// Configuración de Secrets Manager
const secretsManager = new AWS.SecretsManager({ region: process.env.AWS_REGION || "us-east-1" });

async function getDbConfig() {
	const secret = await secretsManager
		.getSecretValue({ SecretId: "db_designacion_tareas_credentials" })
		.promise();
	
	const creds = JSON.parse(secret.SecretString);

	return {
		host: creds.host,
		port: creds.port || 5432,
		database: creds.dbname,
		user: creds.username,
		password: creds.password,
		ssl: { rejectUnauthorized: false } 
	};
}

// Inicializa conexión dinámica
async function initDb() {
	const databaseConfig = await getDbConfig();
	const db = await getDbConfig();
	return db;
}

module.exports = initDb;