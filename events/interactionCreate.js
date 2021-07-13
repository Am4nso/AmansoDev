const moment = require("moment");
const {Order, STATUS_LIST} = require("../order");
const paypal = require("../paypal");
const {MessageEmbed} = require("discord.js");

module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(client, interaction) {
        if (interaction.isCommand()) {
            await client.commands.get(interaction.commandName).execute(client, interaction);
            return;
        }

        if (!interaction.isButton()) return;

        if (interaction.customID === "order") {
            const orderCheck = Order.getOrder(interaction.user.id);
            if (orderCheck !== undefined && ![4, 5].includes(orderCheck.status)) {
                await interaction.reply({
                    content: `**You already have an active order!** <#${orderCheck.channelID}>`,
                    ephemeral: true
                });
                return;
            }

            const orderId = Order.generateId();

            let momentDisplay = moment.utc();

            let orderCreation = new Date(momentDisplay.format());

            const topic = `**Order #${orderId}**\n\n**Client:** ${interaction.user}\n**Created:** ${momentDisplay.format("YYYY-MM-DD HH:mm UTC")}`;

            const orderChannel = await interaction.guild.channels.create(`order-${orderId}`, {
                topic: topic,
                permissionOverwrites: [{id: interaction.user.id, allow: ["VIEW_CHANNEL"]}, {id: interaction.guild.roles.everyone.id, deny: ["VIEW_CHANNEL"]}],
                parent: interaction.guild.channels.cache.get(STATUS_LIST.NEW)
            });

            let order_info = {
                id: orderId,
                client: interaction.user.id,
                channel: orderChannel.id,
                status: 0,
                creationDate: orderCreation
            };

            const order = new Order(order_info);

            client.orders.set(orderChannel.id, order);
            const collection = client.mongo.db(client.mongodb.db).collection(client.mongodb.collection.orders);

            collection.insertOne(order_info);

            const embed = new MessageEmbed()
                .setColor('#6832e3')
                .setTitle('Order #' + orderId)
                .setDescription('Your order has been successfully created! Please answer the question below to post the order.');

            const welcome = await orderChannel.send({content: `${interaction.user}`, embeds: [embed]});

            await interaction.reply({
                content: `**Order has been created!** Please answer the questions in **${orderChannel}**`,
                ephemeral: true
            });

            const questionEmbed = new MessageEmbed()
                .setColor('#6832e3')
                .setDescription('Please provide a detailed description of what you want.');

            const question = await orderChannel.send({embeds: [questionEmbed]});

            const filter = m => m.author.id === interaction.user.id;

            let responseData;

            try {
                responseData = await orderChannel.awaitMessages({filter, max: 1});
            } catch (e) {
                return;
            }

            const responseMessage = responseData.values().next().value;

            await order.setDetails(responseMessage.content);

            await responseMessage.delete();

            await welcome.delete();

            await question.delete();

            const orderDetailsEmbed = new MessageEmbed()
                .setColor('#6832e3')
                .setTitle("Order #" + orderId)
                .setFooter("Order was created on " + momentDisplay.format("YYYY-MM-DD HH:mm UTC"))
                .setDescription(`Your order has been posted.\n\n**Client**\n${interaction.user}\n\n**Details**\n${responseMessage.content}`);

            orderChannel.send({embeds: [orderDetailsEmbed]}).then(value => value.pin());

            orderChannel.send("<@&719016340974862437>").then(value => value.delete());

            await orderChannel.setParent(interaction.guild.channels.cache.get(STATUS_LIST.WAITING), {lockPermissions: false});

            return;
        }

        let order = client.orders.get(interaction.channelID);

        if (order === undefined) {
            return;
        }

        if (order.status !== 2) {
            await interaction.reply("Invoice may not be checked right now.");
            return;
        }

        await interaction.reply("Checking invoice.");

        const status = await paypal.getInvoiceStatus(interaction.customID);

        const embed = new MessageEmbed()
            .setColor('#6832e3')
            .setTitle(`Invoice - Order #${order.id}`)
            .setFooter(`Invoice ID: ${interaction.customID}`)
            .setDescription(`The invoice is ${status.replace("_", " ").toLowerCase()}!`);

        const invoiceList = await order.getInvoices();
        const invoice = invoiceList.find(doc => doc.id === interaction.customID);

        if (status === "UNPAID" || invoice.status === status) {
            await interaction.editReply({content: null, embeds: [embed]});
            return;
        }

        try {
            if (status !== "PARTIALLY_PAID") {
                await interaction.message.edit({components: [[interaction.component.setDisabled(true), interaction.message.components[0].components[1]]]});
            }
            await interaction.editReply({content: null, embeds: [embed]});
        } catch (e) {
            await interaction.editReply("PayPal API failed to respond.");
            console.log(e);
            return;
        }

        await order.setStatus(3);
        await interaction.channel.setParent(interaction.guild.channels.cache.get(STATUS_LIST.ACTIVE), {lockPermissions: false});

        await order.updateInvoice(interaction.customID, status);
    }
}