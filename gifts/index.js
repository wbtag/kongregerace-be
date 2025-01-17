const cosmosInit = require('../lib/cosmosInit');

module.exports = async function (context, req) {

  const container = await cosmosInit(process.env['CosmosGiftsContainerName']);

  let queryString = 'SELECT c.id, c.name, c.link, c.reserved FROM c ORDER BY c.tier ASC';

  if (req.query.availableOnly === 'true') {
    queryString = 'SELECT c.id, c.name, c.link, c.reserved FROM c WHERE c.reserved = false ORDER BY c.tier ASC';
  }

  const queryResults = await container.items.query(queryString).fetchAll();

  const resources = queryResults.resources;

  context.res = {
    status: 200,
    body: resources,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Accept, x-functions-key'
    }
  }
}