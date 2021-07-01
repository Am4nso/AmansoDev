module.exports = {
    name: "close",
    async execute(client, interaction) {

        let order = client.orders.get(interaction.channelID);

        if (order === undefined) {
            await interaction.reply({content: "You can't use this command here.", ephemeral: true});
            return;
        }

        await interaction.reply({content: "Closing order."});

        if (order.status !== 4) {
            await order.setStatus(5);
        }

        const messages = await interaction.channel.messages.fetch();

        await order.storeMessages(messages);

        await interaction.channel.delete();

    }

}
