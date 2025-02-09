const cosmosInit = require('../lib/cosmosInit');

module.exports = async function (context, req, container) {
    const body = req.body;
    const oldRsvp = container.item(body.id, body.id);
    const { resource } = await oldRsvp.read();

    if (!resource) {
        throw new Error('RSVP not found');
    };

    if (req.query.giftChange) {
        const giftContainer = await cosmosInit(process.env['CosmosGiftsContainerName']);
        if (!body.ownGift) { // Guest has chosen a gift from the list => check its availability and reserve it
            await checkGiftAvailability(giftContainer, body.giftId);
            await giftContainer.item(body.giftId, body.giftId).patch({ operations: [{ op: 'replace', path: '/reserved', value: true }] });
            await container.item(body.id, body.id).patch({ operations: [{ op: 'replace', path: '/giftId', value: body.giftId }] });
        } else { // Guest has chosen to bring their own gift => set giftId to null
            await container.item(body.id, body.id).patch({ operations: [{ op: 'replace', path: '/giftId', value: null }] });
        }
        if (resource.giftId) { // Guest previously reserved a different gift => set its reserved param to false
            await giftContainer.item(resource.giftId, resource.giftId).patch({ operations: [{ op: 'replace', path: '/reserved', value: false }] });
        }
        await container.item(body.id, body.id).patch({ operations: [{ op: 'replace', path: '/ownGift', value: body.ownGift }] });
    } else {
        // if (!body.ownGift) { // Guest has chosen a gift from the list in the updated RSVP
        //     const oldGiftExists = !!resource.giftId;
        //     if (resource.giftId != body.giftId) { // Chosen gift differs from a previously chosen gift
        //         const giftContainer = await cosmosInit(process.env['CosmosGiftsContainerName']);
        //         await checkGiftAvailability(giftContainer, body.giftId);

        //         if (oldGiftExists) { // If needed, free up old gift 
        //             await giftContainer.item(resource.giftId, resource.giftId).patch({ operations: [{ op: 'replace', path: '/reserved', value: false }] });
        //         }

        //         // Reserve new gift
        //         await newGift.patch({ operations: [{ op: 'replace', path: '/reserved', value: true }] });
        //     }
        // } else { // Guest has chosen to bring their own gift in the updated RSVP
        //     if (resource.giftId) { // Guest previously chose a gift from the list
        //         const giftContainer = await cosmosInit(process.env['CosmosGiftsContainerName']);

        //         // Free up old gift
        //         const oldGift = giftContainer.item(resource.giftId, resource.giftId);
        //         await oldGift.patch({ operations: [{ op: 'replace', path: '/reserved', value: false }] });
        //     }
        // }
        await oldRsvp.replace(body);
    }

    context.res = {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*'
        }
    }
}

async function checkGiftAvailability(giftContainer, giftId) {
    // Check whether newly chosen gift is not reserved before proceeding
    const newGift = giftContainer.item(giftId, giftId);
    const { resource } = await newGift.read();
    if (resource.reserved) {
        throw new Error('Gift already reserved');
    }
}