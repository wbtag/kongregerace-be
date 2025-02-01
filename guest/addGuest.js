const sendEmail = require('../lib/sendEmail');
const cosmosInit = require('../lib/cosmosInit');
const crypto = require('crypto');

module.exports = async function (context, req) {
    const body = req.body;
    const rsvpId = crypto.randomUUID().split('-')[0].toUpperCase();
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

    const {giftName, ...guestBody} = body;

    const newGuest = {
        id: rsvpId,
        ...guestBody
    }

    const container = await cosmosInit('kgrtest_gst');
    const { resource } = await container.items.create(newGuest);

    const { _rid, _self, _etag, _attachments, _ts, id, giftId, ...guest } = resource;

    const params = {
        id: id,
        gift: giftId ? gift.name : 'vlastní',
        giftLink: giftId ? gift.link : null,
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