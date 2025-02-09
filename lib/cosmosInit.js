const { CosmosClient } = require('@azure/cosmos');
// const cosmosConnectionString = process.env['CosmosConnectionString'];

module.exports = async function cosmosInit(containerName) {
  const cosmosClient = new CosmosClient(process.env['CosmosConnectionString']);
  const container = await cosmosClient.database(process.env['CosmosDatabaseName']).container(containerName);
  return container
}