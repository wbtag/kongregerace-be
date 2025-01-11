const cosmosInit = require('../cosmosInit');

module.exports = async function (context, req, container) {
    const body = req.body;
    const oldRsvp = container.item(body.id, body.id);
    const { resource } = await oldRsvp.read();

    if (!resource) {
        throw new Error('RSVP not found');
    };

    if (!body.ownGift) { // Guest has chosen a gift from the list in the updated RSVP
        const oldGiftExists = !!resource.giftId;
        if (resource.giftId != body.giftId) { // Chosen gift differs from a previously chosen gift
            const giftContainer = await cosmosInit(process.env['CosmosGiftsContainerName']);

            // Check whether newly chosen gift is not reserved before proceeding
            const newGift = giftContainer.item(body.giftId, body.giftId);
            const { resource } = await newGift.read();
            if (resource.reserved) {
                throw new Error('Gift already reserved');
            }

            if (oldGiftExists) { // If needed, free up old gift 
                await giftContainer.item(resource.giftId, resource.giftId).patch({ operations: [{ op: 'replace', path: '/reserved', value: false }] });
            }

            // Reserve new gift
            await newGift.patch({ operations: [{ op: 'replace', path: '/reserved', value: true }] });
        }
    } else { // Guest has chosen to bring their own gift in the updated RSVP
        if (resource.giftId) { // Guest previously chose a gift from the list
            const giftContainer = await cosmosInit(process.env['CosmosGiftsContainerName']);

            // Free up old gift
            const oldGift = giftContainer.item(resource.giftId, resource.giftId);
            await oldGift.patch({ operations: [{ op: 'replace', path: '/reserved', value: false }] });
        }
    }

    await oldRsvp.replace(body);
}