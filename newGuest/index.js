module.exports = async function (context, req) {
    console.log(req.body);

    context.res = {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        }
    }
}