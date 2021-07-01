const fs = require("fs");
const {MessageEmbed} = require("discord.js");
const {Delivery} = require("./../../delivery");

module.exports = {
    name: "deliver",
    async execute(client, interaction) {

        let deliveryId = interaction.options.get("delivery").value;

        let order = client.orders.get(interaction.channelID);

        if (order === undefined) {
            await interaction.reply({content: "You can't use this command here.", ephemeral: true});
            return;
        }

        if (order.status !== 3) {
            await interaction.reply({content: "The order must be ACTIVE to use this command.", ephemeral: true});
            return;
        }

        const delivery = await Delivery.fetch(deliveryId);

        if (delivery === undefined) {
            await interaction.reply({content: "No deliveries found with this id.", ephemeral: true});
            return;
        }

        await interaction.reply({content: "Delivery found. Collecting and posting it.", ephemeral: true});

        await order.addDelivery(deliveryId);

        await delivery.storeDelivery();

        const embed = new MessageEmbed()
            .setColor('#6832e3')
            .setTitle('Your order has been delivered!')
            .setDescription('Thank you for ordering from Amanso Development! Your order has been delivered.\n\nThe order will be closed in 3 days. During the time,' +
                'you may request revisions for the bot.');

        const message = await interaction.channel.send({
            content: `<@${order.clientID}>`,
            embeds: [embed],
            files: [`${deliveryId}.zip`]
        });

        await message.pin();

        fs.unlink(deliveryId + ".zip", () => {
        });

    }

}
