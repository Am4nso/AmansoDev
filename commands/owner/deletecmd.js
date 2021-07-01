module.exports = {
    name: "deletecmd",
    async execute(client, interaction) {
        let command = interaction.options.get("command");

        await client.guilds.cache.get(client.guild_id.toString()).commands.delete(command.value);

        await interaction.reply("Command has been deleted.");

    }

}
