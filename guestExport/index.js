const cosmosInit = require('../lib/cosmosInit');
const { BlobServiceClient } = require("@azure/storage-blob");
const xlsx = require('node-xlsx').default;

module.exports = async function (context, myTimer) {
    const container = await cosmosInit(process.env['CosmosGuestsContainerName']);
    const { resources } = await container.items.query('SELECT * FROM g').fetchAll();
    // 

    let data = [['ID', 'Typ', 'E-mail', 'Jméno a příjmení', 'Doprovod', 'ID daru', 'Účast na veselce']];
    for (const resource of resources) {
        const { id, guestType, name, email, accompanyingGuestName, giftId, eveningAttendance} = resource;
        data.push([
            id, 
            guestType === 'f' ? 'Veselka' : 'Obřad', 
            email, 
            name, 
            accompanyingGuestName, 
            giftId, 
            eveningAttendance ? 'Ano': 'Ne'
        ]);
    }

    const content = xlsx.build([{name: 'guests', data: data}]);
    
    const blobServiceClient = BlobServiceClient.fromConnectionString(process.env['BlobStorageConnectionString']);
    const containerClient = blobServiceClient.getContainerClient('guestdata');
    const blobName = "guests.xlsx";
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.upload(content, content.length);  
}