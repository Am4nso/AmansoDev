const {MessageEmbed, MessageButton} = require("discord.js");

module.exports = {
    name: "showembed",
    async execute(client, interaction) {

        const embed = new MessageEmbed()
            .setColor('#6832e3')
            .setTitle('Order Creation')
            .setDescription('Welcome to Amanso Development!\n\nPress the button :shopping_cart: below to start your order. You will be asked a few questions about your order.\n\nBy clicking the button below, you agree to the Terms of Service located at https://amanso.net/terms.')
            .setFooter('AmansoDev | Created by: Amanso#9143');


        const button = new MessageButton()
            .setCustomID('order')
            .setLabel('Order')
            .setStyle('PRIMARY')
            .setEmoji('🛒');

        await interaction.channel.send({embeds: [embed], components: [[button]]});

        await interaction.reply({content: "Embed posted successfully.", ephemeral: true})


        /*const embed = new MessageEmbed()
            .setColor('#6832e3')
            .setTitle('Terms of Service')
            .setDescription('By ordering from us, you agree to the Amanso Development Terms of Service located at https://amanso.net/terms.');


        const button = new MessageButton()
            .setLabel('Terms of Service')
            .setStyle('LINK')
            .setURL('https://amanso.net/terms');

        await interaction.channel.send({ embeds: [embed], components: [[button]] });

        await interaction.reply({content: "Embed posted successfully.", ephemeral: true})*/

        /*const embed = new MessageEmbed()
            .setColor('#6832e3')
            .setTitle('Rules')
            .setDescription('By joining the Amanso Development Discord Server you agree to and confirm that you have thoroughly read the rules stated below. ' +
                '\n\n\n1. Treat everyone with respect. Absolutely no harassment, witch hunting, sexism, racism, or hate speech will be tolerated.' +
                '\n\n2. No spam or self-promotion (server invites, advertisements, etc) without permission from a staff member. This includes DMing fellow members.' +
                '\n\n3. No NSFW or obscene content. This includes text, images, or links featuring nudity, sex, hard violence, or other graphically disturbing content.' +
                '\n\n4. You have read and agreed to the Amanso Development Terms of Service at https://amanso.net/tos.' +
                '\n\n\nIF YOU DO NOT AGREE WITH THE AMANSO DEVELOPMENT TERMS OF SERVICE, THEN YOU ARE PROHIBITED FROM USING OUR SERVICE AND YOU MUST LEAVE THE DISCORD SERVER IMMEDIATELY.');


        const button = new MessageButton()
            .setLabel('Terms of Service')
            .setStyle('LINK')
            .setURL('https://amanso.net/terms');*/

        await interaction.channel.send({embeds: [embed], components: [[button]]});

        await interaction.reply({content: "Embed posted successfully.", ephemeral: true})

    }

}
