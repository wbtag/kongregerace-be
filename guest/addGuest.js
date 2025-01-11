const sendEmail = require('../sendEmail');
const crypto = require('crypto');
const cosmosInit = require('../cosmosInit');

module.exports = async function (context, req) {
    const body = req.body;
    const rsvpId = crypto.randomUUID();
    let gift;

    if (!body.ownGift) {
        const container = await cosmosInit('kgrtest_g');
        const rawResponse = await container.item(body.giftId, body.giftId).read();
        gift = rawResponse.resource;

        if (gift.reserved) {
            throw new Error('Gift already reserved');
        }

        await container.item(body.giftId, body.giftId).patch({operations: [{op: 'replace', path: '/reserved', value: true}]});
    }

    const newGuest = {
        id: rsvpId,
        ...body
    }

    const container = await cosmosInit('kgrtest_gst');
    const { resource } = await container.items.create(newGuest);

    const { _rid, _self, _etag, _attachments, _ts, id, giftId, ...guest } = resource;

    const params = {
        id: id,
        gift: giftId ? gift.name : 'vlastní',
        ...guest
    };

    await sendEmail(body.email, 1, params, context);

    context.res = {
        status: 200,
        body: {
            id
        },
        headers: {
            'Access-Control-Allow-Origin': '*'
        }
    };

}