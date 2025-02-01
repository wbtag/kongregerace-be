var assert = require('assert');
const addGuest = require('../guest/addGuest');
const getGuest = require('../guest/getGuest');
const localSettings = require('../local.settings.json').Values;
process.env = { ...process.env, ...localSettings };

describe('Guests', async function () {
    it('are fetched properly', async function () {
        const testGuest = {
            name: 'John Doe',
            email: 'test@test.com',
            hasCompany: true,
            accompanyingGuestName: 'Jane Doe',
            ownGift: true,
            giftId: null,
            eveningAttendance: true,
            guestType: 'f'
        };

        const id = await addGuest({}, { body: testGuest });

        const fetchedGuest = await getGuest({}, {
            query: {
                rsvpId: id
            }
        });

    });
    it('are added properly', async function () {

    });
    it('are updated properly', async function () {

    });
    it('are deleted properly', async function () {

    });
});