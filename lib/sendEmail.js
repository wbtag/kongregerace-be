module.exports = async function sendEmail(recipient, templateId, params, context) {

    if (recipient.includes('test') || recipient.includes('example')) {
        return
    };

    const body = {
        to: [
            { email: recipient }
        ],
        templateId,
        params
    };

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'accept': 'application/json',
            'api-key': process.env['BrevoApiKey'],
            'content-type': 'application/json'
        }
    });

    if (!response.ok) {
        context.error(`Send email operation failed for recipient ${recipient}`)
    }
}