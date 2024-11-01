const getGuest = require('./getGuest');
const addGuest = require('./addGuest');
const removeGuest = require('./removeGuest');
const updateGuest = require('./updateGuest.js');

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
    } else if (req.method === 'GET') {
        await getGuest(context, req);
    } else if (req.method === 'POST') {
        await addGuest(context, req);
    } else if (req.method === 'PUT') {
        await updateGuest(context, req);
    } else if (req.method === 'DELETE') {
        await removeGuest(context, req);
    }
}   
