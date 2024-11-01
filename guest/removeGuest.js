const query = require('../query');

module.exports = async function (context, req) {

    const rsvpId = req.rsvpId;

    await query(`DELETE FROM [dbo].[Host] WHERE rsvpId = '${rsvpId}'`)

    context.res = {
        status: 200,
        body: formattedData,
        headers: {
            'Access-Control-Allow-Origin': '*'
        }
    }
}