const {MessageEmbed, MessageButton} = require("discord.js");

module.exports = {
    name: "complete",
    async execute(client, interaction) {
        let order = client.orders.get(interaction.channelID);

        if (order === undefined) {
            await interaction.reply({content: "You can't use this command here.", ephemeral: true});
            return;
        }

        if (order.status !== 3) {
            await interaction.reply({content: "The order must be ACTIVE to use this command.", ephemeral: true});
            return;
        }

        const deliveries = await order.getDeliveries();

        if (deliveries.length === 0) {
            await interaction.reply({content: "No recent deliveries found for this order.", ephemeral: true});
            return;
        }

        await interaction.reply({content: "Checks passed. Finalizing the order.", ephemeral: true});

        await order.setStatus(4);

        const embed = new MessageEmbed()
            .setColor('#6832e3')
            .setTitle('Thank you for your order!')
            .setDescription('Your order is now complete. Please vouch for us in the official mc-market thread and leave a rep in Amanso profile.\n\n**Thread:** \n**Profile:** https://www.mc-market.org/members/67503/\n\nWe hope to see you again!');


        const profile = new MessageButton()
            .setLabel('Profile')
            .setStyle('LINK')
            .setURL('https://www.mc-market.org/members/67503/');

        const thread = new MessageButton()
            .setLabel('Thread')
            .setStyle('LINK')
            .setURL('https://www.mc-market.org/threads/671193/');

        await interaction.channel.send({
            content: `<@${order.clientID}>`,
            embeds: [embed],
            components: [[profile, thread]]
        });

        await interaction.editReply({content: "The order has been marked as COMPLETE.", ephemeral: true});

    }

}
