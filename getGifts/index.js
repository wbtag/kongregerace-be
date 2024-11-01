const query = require('../query');

module.exports = async function (context, req) {

  let queryString = 'SELECT * FROM [dbo].[Dar] ORDER BY name ASC';

  if (req.query.availableOnly) {
    queryString = 'SELECT * FROM [dbo].[Dar] WHERE reserved = 0 ORDER BY name ASC'
  }

  const gifts = await query(queryString);

  context.res = {
    status: 200,
    body: gifts,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
}