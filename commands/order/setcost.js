module.exports = {
    name: "setcost",
    async execute(client, interaction) {

        let amount = interaction.options.get("amount");

        let order = client.orders.get(interaction.channelID);

        if (order === undefined) {
            await interaction.reply({content: "You can't use this command here.", ephemeral: true});
            return;
        }

        await order.setCost(amount.value);

        await interaction.reply(`The order cost has been set to \`$${amount.value}\`.`);
    }

}
