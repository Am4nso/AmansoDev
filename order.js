const bot = require("./bot.js");
const {Delivery} = require("./delivery");
const zlib = require('zlib');
const util = require('util');
const deflate = util.promisify(zlib.deflate);
const inflate = util.promisify(zlib.inflate);

class Order {

    static lastOrderId = 0;

    constructor(data) {

        this.id = data.id;
        this.clientID = data.client;
        this.channelID = data.channel;
        this.status = data.status;
        this.creationDate = data.creationDate;

    }

    static generateId() {
        this.lastOrderId += 1;
        return this.lastOrderId;
    }

    static async fetch(id) {

        const COLLECTION = bot.client.mongo.db(bot.client.mongodb.db).collection(bot.client.mongodb.collection.orders);

        const document = await COLLECTION.findOne({id: id});

        if (document == null) {
            throw new OrderNotFound("Order was not found in the database.")
        }

        const order = await new Order(document);

        bot.client.orders.set(id, order);

        return order;
    }

    static getOrder(clientID) {
        return bot.client.orders.find(value => value.clientID === clientID);
    }

    async setStatus(status) {
        if (!status in STATUS_LIST) {
            throw new StatusDoesNotExist(`${status} is not a valid status number.`)
        }

        this.status = status;

        const COLLECTION = bot.client.mongo.db(bot.client.mongodb.db).collection(bot.client.mongodb.collection.orders);

        await COLLECTION.updateOne({id: this.id}, {$set: {status: status}});
    }

    async storeMessages(messages) {
        const array = Array.from(messages.values());

        let enc = new TextEncoder();

        const finalArray = enc.encode(JSON.stringify(array));

        const compressedBody = await deflate(finalArray);

        const COLLECTION = bot.client.mongo.db(bot.client.mongodb.db).collection(bot.client.mongodb.collection.orders);

        await COLLECTION.updateOne({id: this.id}, {$set: {messageHistory: compressedBody}});
    }

    async setCost(amount) {
        const COLLECTION = bot.client.mongo.db(bot.client.mongodb.db).collection(bot.client.mongodb.collection.orders);

        await COLLECTION.updateOne({id: this.id}, {$set: {cost: amount}});
    }

    async getCost() {
        const COLLECTION = bot.client.mongo.db(bot.client.mongodb.db).collection(bot.client.mongodb.collection.orders);

        const document = await COLLECTION.findOne({id: this.id});

        return document.cost;
    }

    async getMessageHistory() {

        const COLLECTION = bot.client.mongo.db(bot.client.mongodb.db).collection(bot.client.mongodb.collection.orders);

        const document = await COLLECTION.findOne({id: this.id});

        const compressedData = document.messageHistory;

        console.log(compressedData)

        const uncompressedBody = await inflate(compressedData.buffer);

        let dec = new TextDecoder();

        return JSON.parse(dec.decode(uncompressedBody));
    }

    async addInvoice(invoiceId, status) {
        const COLLECTION = bot.client.mongo.db(bot.client.mongodb.db).collection(bot.client.mongodb.collection.orders);

        try {
            await COLLECTION.updateOne({id: this.id}, {$push: {invoices: {id: invoiceId, status: status}}});
        } catch (e) {
            await COLLECTION.updateOne({id: this.id}, {$set: {invoices: [{id: invoiceId, status: status}]}});
        }
    }

    async getInvoices() {
        const COLLECTION = bot.client.mongo.db(bot.client.mongodb.db).collection(bot.client.mongodb.collection.orders);
        const document = await COLLECTION.findOne({id: this.id});

        return document.invoices;
    }

    async updateInvoice(invoiceId, status) {
        const COLLECTION = bot.client.mongo.db(bot.client.mongodb.db).collection(bot.client.mongodb.collection.orders);

        const invoiceList = await this.getInvoices();

        let objIndex = invoiceList.findIndex((obj => obj.id = invoiceId));

        invoiceList[objIndex].status = status;

        await COLLECTION.updateOne({id: this.id}, {$set: {invoices: invoiceList}});

    }

    async getDeliveries() {
        const COLLECTION = bot.client.mongo.db(bot.client.mongodb.db).collection(bot.client.mongodb.collection.orders);

        const document = await COLLECTION.findOne({id: this.id});

        document.deliveries.forEach((async id => {
            id = await Delivery.fetch(id);
        }));

        return document.deliveries;
    }

    async addDelivery(deliveryId) {
        const COLLECTION = bot.client.mongo.db(bot.client.mongodb.db).collection(bot.client.mongodb.collection.orders);

        try {
            await COLLECTION.updateOne({id: this.id}, {$push: {deliveries: deliveryId}});
        } catch (e) {
            await COLLECTION.updateOne({id: this.id}, {$set: {deliveries: [deliveryId]}});
        }
    }

    async setDetails(details) {
        const COLLECTION = bot.client.mongo.db(bot.client.mongodb.db).collection(bot.client.mongodb.collection.orders);

        await COLLECTION.updateOne({id: this.id}, {$set: {details: details}});
    }

    toString() {
        return this.id;
    }

}

const STATUS_LIST = {
    NEW: '719014450153259069', // 0
    WAITING: '719014609662509128', // 1
    PENDING: '720521324589482034', // 2
    ACTIVE: '719014837954412594', // 3
    COMPLETE: null, // 4
    CLOSED: null // 5
};


class OrderNotFound extends Error { /* ... */
}

class StatusDoesNotExist extends Error { /* ... */
}

module.exports.Order = Order;
module.exports.STATUS_LIST = STATUS_LIST;
