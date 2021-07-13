const axios = require("axios");
const {MessageEmbed} = require("discord.js");
const {Delivery} = require("../delivery");

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(client, message) {

        if (message.channel.id !== '859881264412229642' || message.author.bot) return;

        let fileURL;

        try {
            fileURL = message.attachments.values().next().value.url;
        } catch (e) {
            return;
        }

        const response = await axios({
            url: fileURL,
            method: 'GET',
            responseType: 'arraybuffer'
        });

        const delivery = await Delivery.newDelivery(response.data);

        const embed = new MessageEmbed()
            .setColor('#6832e3')
            .setTitle('Delivery')
            .setDescription(`**ID:** ${delivery.id}`);

        await message.channel.send({embeds: [embed]});

    },
}