const paypal = require("./../../paypal")
const fs = require("fs");
const {MessageButton, MessageEmbed} = require("discord.js");

module.exports = {
    name: "sendinvoice",
    async execute(client, interaction) {
        let order = client.orders.get(interaction.channelID);

        let info = interaction.options.get("info");

        if (order === undefined) {
            await interaction.reply({content: "You can't use this command here.", ephemeral: true});
            return;
        }

        const cost = await order.getCost();

        if (cost === undefined) {
            await interaction.reply({content: "No price was set for this order.", ephemeral: true});
            return;
        }

        if (order.status !== 2) {
            await interaction.reply({content: "The order must be PENDING to send an invoice.", ephemeral: true});
            return;
        }

        await interaction.reply({content: "Checks passed. Contacting PayPal API for invoice.", ephemeral: true});

        const {id, url} = await paypal.createPaypalInvoice(order.id, cost, info.value);

        await interaction.editReply({content: "PayPal API responded.", ephemeral: true});

        const embed = new MessageEmbed()
            .setColor('#6832e3')
            .setTitle(`Invoice - Order #${order.id}`)
            .setFooter(`Invoice ID: ${id}`)
            .setDescription(`Thank you for choosing Amanso Development! Please pay this invoice to continue with your order.\n\n**You may click the button below or scan the QR code to view the invoice.**\n\nPress the verify button after you have paid this invoice to confirm.`)
            .setThumbnail(`attachment://qr.png`);

        const button = new MessageButton()
            .setLabel('Verify')
            .setStyle('SUCCESS')
            .setCustomID(id);

        const urlButton = new MessageButton()
            .setLabel('View Invoice')
            .setStyle('LINK')
            .setURL(url);

        const message = await interaction.channel.send({
            embeds: [embed],
            components: [[button, urlButton]],
            files: [{attachment: id + ".png", name: "qr.png"}]
        });

        await message.pin();

        await interaction.editReply({content: "Embed has been posted.", ephemeral: true});

        fs.unlink(id + ".png", () => {
        });

        await order.addInvoice(id, "UNPAID");

    }

}
