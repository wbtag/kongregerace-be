const getGuest = require('./getGuest');
const addGuest = require('./addGuest');
const removeGuest = require('./removeGuest');
const updateGuest = require('./updateGuest.js');
const cosmosInit = require('../lib/cosmosInit.js');

module.exports = async function (context, req) {

    if (req.method === 'OPTIONS') {
        context.res = {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS, GET, POST, PUT, DELETE',
                'Access-Control-Allow-Headers': 'Content-Type, Accept',
            }
        }
    } else {
        const container = await cosmosInit(process.env['CosmosGuestsContainerName']);
        try {
            if (req.method === 'GET') {
                await getGuest(context, req, container);
            } else if (req.method === 'POST') {
                await addGuest(context, req);
            } else if (req.method === 'PUT') {
                await updateGuest(context, req, container);
            } else if (req.method === 'DELETE') {
                await removeGuest(context, req, container);
            }
        } catch (err) {
            if (err.message === 'RSVP not found') {
                context.res = {
                    status: 404,
                    body: {
                        message: 'RSVP not found'
                    },
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                    }
                }
            } else if (err.message === 'Gift already reserved') {
                context.res = {
                    status: 400,
                    body: {
                        message: 'Gift already reserved'
                    },
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                    }
                }
            } else if (err.code === 409) {
                context.res = {
                    status: 418,
                    body: {
                        message: 'You son of a bitch, you actually did it'
                    },
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                    }
                }
            } else {
                context.log.error(err);
                context.res = {
                    status: 500,
                    body: {
                        message: 'Internal server error'
                    },
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                    }
                }
            }
        }
    }
}   
