const query = require('../query');
const crypto = require('crypto');

module.exports = async function (context, req) {
    if (req.method === 'OPTIONS') {
        context.res = {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS, POST',
                'Access-Control-Allow-Headers': 'Content-Type, Accept',
            }
        }
    } else {
        const body = req.body;
        console.log(body);
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
        
            context.res = {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        };
    }
}   
