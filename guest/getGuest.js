const cosmosInit = require("../cosmosInit");

module.exports = async function (context, req, container) {

    const rsvpId = req.query.rsvpId;

    const { resource } = await container.item(rsvpId, rsvpId).read();

    const { _rid, _self, _etag, _attachments, _ts, ownGift, giftId, ...rest } = resource;

    let gift;
    if (giftId) {
        const giftContainer = await cosmosInit(process.env['CosmosGiftsContainerName']);
        const { resource } = await giftContainer.item(giftId, giftId).read();
        gift = resource;
    }


    const formattedData = {
        guest: {
            ...rest,
            ownGift: ownGift ? true : false,
            giftId: ownGift ? null : giftId
        },
        gift: {
            name: ownGift ? null : gift.name
        }
    }

    context.res = {
        status: 200,
        body: formattedData,
        headers: {
            'Access-Control-Allow-Origin': '*'
        }
    }
}