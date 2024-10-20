const query = require('../query');

module.exports = async function (context, req) {

  const gifts = await query(`SELECT * FROM [dbo].[Dar] WHERE reserved = 0 ORDER BY name ASC`)

  context.res = {
    status: 200,
    body: gifts,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
}