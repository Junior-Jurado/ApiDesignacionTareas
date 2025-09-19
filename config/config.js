const promise = require("bluebird");
const options = {
  promiseLib: promise,
  query: (e) => {},
};
const AWS = require("aws-sdk");
const pgp = require("pg-promise")(options);

const types = pgp.pg.types;
types.setTypeParser(1114, (stringValue) => stringValue);

const secretsManager = new AWS.SecretsManager({
  region: process.env.AWS_REGION || "us-east-1",
});


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
    ssl: { rejectUnauthorized: false },
  };
}


async function initDb() {
  const databaseConfig = await getDbConfig();
  return pgp(databaseConfig); 
}

module.exports = initDb;
