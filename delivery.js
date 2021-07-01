const bot = require("./bot.js");
const zlib = require('zlib');
const util = require('util');
const fs = require("fs");
const inflate = util.promisify(zlib.inflate);
const deflate = util.promisify(zlib.deflate);

class Delivery {

    static lastDeliveryId = 0;
    static cache = new Map();

    constructor(id, fileData) {
        this.data = fileData;
        this.id = id;
    }

    static generateId() {
        this.lastDeliveryId += 1;
        return this.lastDeliveryId;
    }

    static async newDelivery(fileData) {
        const COLLECTION = bot.client.mongo.db(bot.client.mongodb.db).collection(bot.client.mongodb.collection.deliveries);

        const deliveryId = this.generateId();

        const compressed = await deflate(fileData);

        await COLLECTION.insertOne({id: deliveryId, data: compressed});

        const delivery = new Delivery(deliveryId, compressed);

        this.cache[deliveryId.toString()] = delivery;

        return delivery;
    }

    static async fetch(deliveryId) {
        if (this.cache.has(deliveryId)) {
            return this.cache.get(deliveryId);
        }

        const COLLECTION = bot.client.mongo.db(bot.client.mongodb.db).collection(bot.client.mongodb.collection.deliveries);

        const document = await COLLECTION.findOne({id: parseInt(deliveryId)});

        const delivery = new Delivery(document.id, document.data);

        this.cache[document.id.toString()] = delivery;

        return delivery;
    }

    async storeDelivery() {

        const uncompressed = await inflate(this.data.buffer);

        fs.writeFile(`${this.id}.zip`, uncompressed, () => {
        });

    }
}


module.exports.Delivery = Delivery;