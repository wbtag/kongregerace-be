const query = require('../query');
const sendEmail = require('../sendEmail');
const crypto = require('crypto');

module.exports = async function(context, req) {
    const body = req.body;
    const rsvpId = crypto.randomUUID();
    const ownGift = body.giftType === 'own' ? true : false;
    await query(`
                INSERT INTO [dbo].[Host] 
                (rsvpId, guestType, name, email, accompanyingGuest, accompanyingGuestName, ownGift, giftId, attendEvening)
                VALUES ('${rsvpId}', '${body.type}', '${body.name}', '${body.email}', '${body.hasCompany}', 
                '${body.accompanyingGuestName}', '${ownGift}', '${body.giftId}', '${body.eveningAttendance}')`);
    
    if (!ownGift) {
        await query(`UPDATE [dbo].[Dar]
                        SET reserved = 1 
                        WHERE id = ${body.giftId}`);
    }
    
    const params = {
        guestName: body.name,
        guestType: body.type,
        email: body.email,
        accompanyingGuest: body.hasCompany,
        accompanyingGuestName: body.accompanyingGuestName,
        gift: body.giftId,
        evening: body.eveningAttendance,
        rsvpId
    }
    
    await sendEmail(body.email, 1, params, context);
    
    context.res = {
        status: 200,
        body: {
            rsvpId
        },
        headers: {
            'Access-Control-Allow-Origin': '*'
        }
    };
}