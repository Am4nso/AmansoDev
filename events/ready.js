const {Delivery} = require("../delivery");
const {Order} = require('../order.js')

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {

        await client.mongo.connect();

        const database = client.mongo.db(client.mongodb.db);

        const ordersCol = database.collection(client.mongodb.collection.orders);

        const lastDocument = ordersCol.aggregate([{$sort: {id: -1}}, {$limit: 1}]);

        lastDocument.forEach((doc) => {
            Order.lastOrderId = doc.id;
        });

        const documents = ordersCol.find({status: {$ne: 5}});

        await documents.forEach((doc) => {
            client.orders.set(doc.channel, new Order(doc));
        });

        const deliveryCol = database.collection(client.mongodb.collection.deliveries);

        const lastDelivery = deliveryCol.aggregate([{$sort: {id: -1}}, {$limit: 1}]);

        lastDelivery.forEach((doc) => {
            Delivery.lastDeliveryId = doc.id;
        });

        console.log("The bot is now ready.");
    },
}