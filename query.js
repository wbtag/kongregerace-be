const sql = require('mssql');

module.exports = async function queryDatabase(query) {
    let config;

    if (process.env['EnvironmentType'] === 'dev') {
      config = {
        server: process.env['DatabaseServer'],
        database: process.env['DatabaseName'],
        user: process.env['DatabaseUsername'],
        password: process.env['DatabaseUserPassword'],
        options: {
          trustedConnection: true,
          trustServerCertificate: true,
        },
        driver: "msnodesqlv8", 
      };
    } 

    await sql.connect(config);
    const result = await sql.query(query);

    return result.recordset
}