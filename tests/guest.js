const assert = require('assert');
const addGuest = require('../guest/addGuest');
const getGuest = require('../guest/getGuest');
const cosmosInit = require('../lib/cosmosInit');
const updateGuest = require('../guest/updateGuest');
const removeGuest = require('../guest/removeGuest');
const localSettings = require('../local.settings.json').Values;
process.env = { ...process.env, ...localSettings };

describe('The guest function', async function () {

    let context = {};
    let id, giftContainer, guestContainer;

    let testGuest = {
        name: 'John Doe',
        email: 'test@test.com',
        hasCompany: true,
        accompanyingGuestName: 'Jane Doe',
        ownGift: true,
        giftId: null,
        eveningAttendance: true,
        guestType: 'f'
    };

    let testGift1 = {
        id: '12345',
        name: 'Big Chungus',
        link: 'https://static.wikia.nocookie.net/videogamefanon/images/e/ee/Big_chungus_by_lapdraws_dcxd3lu-fullview.jpg/revision/latest/scale-to-width-down/1280?cb=20221009195034',
        reserved: false,
        tier: 4
    }

    let testGift2 = {
        id: '67890',
        name: 'Big Chungus 2',
        link: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXX-EO3SuWNO0W7iiLVfeRksPPHlaXWzh4Fw&s',
        reserved: false,
        tier: 5
    }

    before(async function () {
        await addGuest(context, { body: testGuest });
        id = context.res?.body?.id;
        guestContainer = await cosmosInit('guests');
        giftContainer = await cosmosInit('gifts');
        await giftContainer.items.create(testGift1);
        await giftContainer.items.create(testGift2);
    });

    after(async function () {
        await giftContainer.item(testGift1.id, testGift1.id).delete();
        await giftContainer.item(testGift2.id, testGift2.id).delete();
    })

    it('fetches a valid guest', async function () {
        await getGuest(context, {
            query: {
                rsvpId: id
            }
        }, guestContainer);

        const fetchedGuest = context.res?.body

        assert.equal(testGuest.name, fetchedGuest.guest.name);
        assert.equal(testGuest.email, fetchedGuest.guest.email);
        assert.equal(testGuest.ownGift, fetchedGuest.guest.ownGift);
    });
    it('updates guest RSVP info', async function () {
        testGuest.hasCompany = false;
        testGuest.accompanyingGuestName = null;
        testGuest.id = id;

        await updateGuest(context, {
            body: testGuest,
            query: {
                giftChange: false
            }
        }, guestContainer);

        assert.equal(204, context.res?.status);

        const { resource } = await guestContainer.item(id, id).read();

        assert.equal(testGuest.name, resource.name);
        assert.equal(testGuest.hasCompany, resource.hasCompany);
        assert.equal(testGuest.accompanyingGuestName, resource.accompanyingGuestName);
    });
    it('updates guest gift - own gift => gift from list', async function () {

        testGuest.ownGift = false;
        testGuest.giftId = testGift1.id;

        await updateGuest(context, {
            body: testGuest,
            query: {
                giftChange: true
            }
        }, guestContainer);

        assert.equal(204, context.res?.status);

        const { resource } = await guestContainer.item(id, id).read();

        assert.equal(testGuest.name, resource.name);
        assert.equal(testGuest.hasCompany, resource.hasCompany);
        assert.equal(testGuest.giftId, resource.giftId);

        const giftResponse = await giftContainer.item(testGift1.id, testGift1.id).read();
        const gift = giftResponse.resource;

        assert.equal(testGift1.name, gift.name);
        assert.equal(true, gift.reserved);
    });
    it('updates guest gift - gift from list => gift from list', async function () {
        testGuest.giftId = testGift2.id;

        await updateGuest(context, {
            body: testGuest,
            query: {
                giftChange: true
            }
        }, guestContainer);

        assert.equal(204, context.res?.status);

        const { resource } = await guestContainer.item(id, id).read();

        assert.equal(testGuest.name, resource.name);
        assert.equal(testGuest.hasCompany, resource.hasCompany);
        assert.equal(testGuest.giftId, resource.giftId);

        const giftResponse = await giftContainer.item(testGift1.id, testGift1.id).read();
        const gift2Response = await giftContainer.item(testGift2.id, testGift2.id).read();
        const gift = giftResponse.resource;
        const gift2 = gift2Response.resource;

        assert.equal(testGift1.name, gift.name);
        assert.equal(false, gift.reserved);

        assert.equal(testGift2.name, gift2.name);
        assert.equal(true, gift2.reserved);
    });
    it('fails when an already reserved gift is selected', async function () {
        let success = false;
        try {
            await updateGuest(context, {
                body: testGuest,
                query: {
                    giftChange: true
                }
            }, guestContainer);
            success = true;
        } catch (err) {
            assert.equal('Gift already reserved', err.message);
        }
        assert.equal(false, success)
    });
    it('updates guest gift - gift from list => own gift', async function () {

        testGuest.ownGift = true;
        testGuest.giftId = null;

        await updateGuest(context, {
            body: testGuest,
            query: {
                giftChange: true
            }
        }, guestContainer);

        assert.equal(204, context.res?.status);

        const { resource } = await guestContainer.item(id, id).read();

        assert.equal(testGuest.name, resource.name);
        assert.equal(testGuest.hasCompany, resource.hasCompany);
        assert.equal(testGuest.ownGift, resource.ownGift);
        assert.equal(testGuest.giftId, resource.giftId);

        const gift2Response = await giftContainer.item(testGift2.id, testGift2.id).read();
        const gift2 = gift2Response.resource;

        assert.equal(testGift2.name, gift2.name);
        assert.equal(false, gift2.reserved);
    });
    it('deletes a guest', async function () {
        await removeGuest(context, {
            query: {
                rsvpId: id
            }
        }, guestContainer)

        assert.equal(204, context.res?.status);
    });
    it('fails to fetch an invalid guest', async function () {
        let success = false;
        try {
            await getGuest(context, {
                query: {
                    rsvpId: id
                }
            }, guestContainer);
            success = true;
        } catch (err) {
            assert.equal('RSVP not found', err.message);
        }
        assert.equal(false, success);
    });
});