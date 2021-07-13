module.exports = {
    name: "registercmd",
    async execute(client, interaction) {

        let data = interaction.options.get("data");

        console.log(data.value)

        let command;

        try {
            command = await client.guilds.cache.get(client.guild_id.toString()).commands.create(JSON.parse(data.value));
        } catch (e) {
            await interaction.reply(`An error has occurred and the command wasn't created.`);
            console.log(e);
            return;
        }

        await interaction.reply(`Command has been registered with id \`${command.id}\``);

    }

}
