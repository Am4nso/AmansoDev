const axios = require('axios');
const fs = require("fs");
const {paypal} = require("./config.json");

let TOKEN;

async function getNewToken() {
    let response;

    try {
        response = await axios({
            method: 'post',
            url: 'https://api-m.paypal.com/v1/oauth2/token/',
            data: 'grant_type=client_credentials',
            auth: {username: paypal.client_id, password: paypal.secret},
            headers: {
                'Accept': 'application/json',
                'Accept-Language': 'en_US',
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
    } catch (e) {
        console.log(e.response.data);
        return;
    }

    TOKEN = response.data.access_token;

    return TOKEN;
}

async function createPaypalInvoice(orderId, amount, info) {

    const data = `{"detail":{"reference":"Order #${orderId}","currency_code":"USD","note":"Thank you for ordering from Amanso Development.","terms_and_conditions":"https://amanso.net/terms"},"invoicer":{"website":"https://amanso.net","logo_url":"https://i.imgur.com/tCfUqfQ.png"},"items":[{"name":"Discord Bot","description":"${info}","quantity":"1","unit_amount":{"currency_code":"USD","value":"${amount}"},"unit_of_measure":"AMOUNT"}],"configuration":{"partial_payment":{"allow_partial_payment":true,"minimum_amount_due":{"currency_code":"USD","value":"${(parseInt(amount) / 2).toString()}"}},"allow_tip":false,"tax_calculated_after_discount":true,"tax_inclusive":false}}`;

    let response;
    try {
        response = await axios.post("https://api.paypal.com/v2/invoicing/invoices", data, {
            headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}`}
        });
    } catch (e) {
        await getNewToken();
        response = await axios.post("https://api.paypal.com/v2/invoicing/invoices", data, {
            headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}`}
        });
    }

    const invoiceId = response.data.href.split("/").pop();

    const invoiceURL = await sendInvoice(response.data.href);

    await generateQRCode(invoiceId);

    return {id: invoiceId, url: invoiceURL}

}

async function sendInvoice(invoice) {

    let response;

    try {
        response = await axios.post(`${invoice}/send`, {send_to_invoicer: false, send_to_recipient: false}, {
            headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}`}
        });
    } catch (e) {
        await getNewToken();
        response = await axios.post(`${invoice}/send`, {send_to_invoicer: false, send_to_recipient: false}, {
            headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}`}
        });
    }

    return response.data.href;
}

async function generateQRCode(invoiceId) {
    let response;

    try {
        response = await axios.post(`https://api.paypal.com/v2/invoicing/invoices/${invoiceId}/generate-qr-code`, {}, {
            headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}`}
        });
    } catch (e) {
        await getNewToken();
        response = await axios.post(`https://api.paypal.com/v2/invoicing/invoices/${invoiceId}/generate-qr-code`, {}, {
            headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}`}
        });
    }

    const data = response.data.split(/\r?\n/);
    data.splice(0, 4);
    data.pop();

    fs.writeFile(`${invoiceId}.png`, data.join(""), {encoding: 'base64'}, () => {
    });
}

async function getInvoiceStatus(invoiceId) {
    let response;

    try {
        response = await axios.get(`https://api.paypal.com/v2/invoicing/invoices/${invoiceId}`, {
            headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}`}
        });
    } catch (e) {
        await getNewToken();
        response = await axios.get(`https://api.paypal.com/v2/invoicing/invoices/${invoiceId}`, {
            headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}`}
        });
    }

    return response.data.status;
}

module.exports.createPaypalInvoice = createPaypalInvoice;
module.exports.getInvoiceStatus = getInvoiceStatus;