module.exports = {
    name: "cancel",
    async execute(client, interaction) {

        let order = client.orders.get(interaction.channelID);

        if (order === undefined) {
            await interaction.reply({content: "You can't use this command here.", ephemeral: true});
            return;
        }

        if ([2, 3].includes(order.status)) {
            await interaction.reply({content: "You can't use this command right now.", ephemeral: true});
            return;
        }

        await interaction.reply({content: "Order canceled."});

        await order.setStatus(5);

        const messages = await interaction.channel.messages.fetch();

        await order.storeMessages(messages);

        await interaction.channel.delete();

    }

}
