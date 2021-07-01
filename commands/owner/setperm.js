module.exports = {
    name: "setperm",
    async execute(client, interaction) {
        let command = interaction.options.get("command");
        let perm = interaction.options.get("data");

        let cmd;
        try {
            cmd = await client.guilds.cache.get(client.guild_id.toString()).commands.fetch(command.value);
        } catch (e) {
            console.log(e)
            await interaction.reply("An error has occurred and the permission was not set.")
            return;
        }

        try {
            await cmd.setPermissions(JSON.parse(perm.value));
        } catch (e) {
            console.log(e)
            await interaction.reply("An error has occurred and the permission was not set.")
            return;
        }

        await interaction.reply("The command permission has been successfully.")
    }

}
