module.exports = {
    name: "shutdown",
    async execute(client, interaction) {
        await interaction.reply({content: "Shutting down.", ephemeral: true})

        await client.mongo.close()

        client.destroy();

    }
}
