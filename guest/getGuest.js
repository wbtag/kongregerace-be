const cosmosInit = require("../lib/cosmosInit");

module.exports = async function (context, req, container) {

    const rsvpId = req.query.rsvpId;

    const { resource } = await container.item(rsvpId, rsvpId).read();

    if (!resource) {
        throw new Error('RSVP not found');
    }

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
            name: giftId ? gift.name : null,
            link: giftId ? gift.link : null
        }
    }

    const headers = {
        'Access-Control-Allow-Origin': '*'
    }

    if (req.query.setCookie) {
        headers['Set-Cookie'] = `gt=${resource.guestType}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=15552000`
    }

    context.res = {
        status: 200,
        body: formattedData,
        headers: headers
    }
}