const query = require('../query');

module.exports = async function (context, req) {

    const rsvpId = req.query.rsvpId;

    const data = await query(`select * from [dbo].[Host] where rsvpId = '${rsvpId}'`);

    const formattedData = {
        guestType: data[0].guestType,
        name: data[0].name,
        email: data[0].email,
        hasCompany: data[0].accompanyingGuest,
        accompanyingGuestName: data[0].accompanyingGuest ? data[0].accompanyingGuestName : "",
        giftType: data[0].ownGift ? 'own' : 'fromList',
        giftId: data[0].ownGift ? 0 : data[0].giftId,
        eveningAttendance: data[0].attendEvening
    }

    context.res = {
        status: 200,
        body: formattedData,
        headers: {
            'Access-Control-Allow-Origin': '*'
        }
    }
}