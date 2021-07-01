const {STATUS_LIST} = require("../../order");

module.exports = {
    name: "pending",
    async execute(client, interaction) {
        let order = client.orders.get(interaction.channelID.toString());

        if (order === undefined) {
            await interaction.reply({content: "You can't use this command here.", ephemeral: true});
            return;
        }

        if (order.status === 4) {
            await interaction.reply({content: "The order is COMPLETE and may not be PENDING.", ephemeral: true});
            return;
        }

        await order.setStatus(2);

        await interaction.channel.setParent(interaction.guild.channels.cache.get(STATUS_LIST.PENDING), {lockPermissions: false});

        await interaction.reply({content: "The order has been marked as PENDING."});

    }

}
