module.exports = async function (context, req, container) {

    const rsvpId = req.query.rsvpId;

    const response = await container.item(rsvpId, rsvpId).delete();

    if(!response.statusCode === 204) {
        throw new Error(`Error deleting guest ${rsvpId}`);   
    }

    context.res = {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        }
    }
}