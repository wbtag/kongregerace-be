const cosmosInit = require('../lib/cosmosInit');
const { BlobServiceClient } = require("@azure/storage-blob");
const xlsx = require('node-xlsx').default;

module.exports = async function (context, myTimer) {
    const container = await cosmosInit(process.env['CosmosGuestsContainerName']);
    const { resources } = await container.items.query('SELECT * FROM g').fetchAll();
    // 

    let data = [['ID', 'Typ hosta', 'Typ účasti', 'Jméno a příjmení', 'E-mail', 'Účast na veselce', 'Dar']];
    for (const resource of resources) {
        const { id, guestType, name, email, hasCompany, accompanyingGuestName, eveningAttendance, ownGift, placeholder } = resource;
        if (!placeholder) {
            data.push([
                id,
                "Host",
                guestType === 'f' ? 'Veselka' : 'Obřad',
                name,
                email,
                eveningAttendance ? 'Ano' : 'Ne',
                ownGift ? "Vlastní" : "Ze seznamu"
            ]);
            if (hasCompany) {
                data.push([
                    id,
                    "Doprovod",
                    guestType === 'f' ? 'Veselka' : 'Obřad',
                    accompanyingGuestName,
                    email,
                    eveningAttendance ? 'Ano' : 'Ne',
                    ownGift ? "Vlastní" : "Ze seznamu"
                ])
            }
        }
    }

    const sheetOptions = {'!cols': [{wch: 12}, {wch: 12}, {wch: 10}, {wch: 25}, {wch: 25}, {wch: 15}, {wch: 13}]};
    const content = xlsx.build([{ name: 'guests', data: data }], {sheetOptions});

    const blobServiceClient = BlobServiceClient.fromConnectionString(process.env['BlobStorageConnectionString']);
    const containerClient = blobServiceClient.getContainerClient('guestdata');
    const blobName = "guests.xlsx";
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.upload(content, content.length);
}