const query = require('../query');

module.exports = async function (context, req) {

  const gifts = await query(`select * from [dbo].[Dar] order by name asc`)

  context.res = {
    status: 200,
    body: gifts,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
}