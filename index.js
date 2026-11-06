const {
    Client,
    GatewayIntentBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionsBitField,
    ChannelType
} = require('discord.js');

require('dotenv').config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

const SUPPORT_ROLE_ID = 'PUT_ROLE_ID_HERE';

client.once('ready', () => {
    console.log(`Bot is online: ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'open_ticket') {
        const existing = interaction.guild.channels.cache.find(
            c => c.name === `ticket-${interaction.user.id}`
        );

        if (existing) {
            return interaction.reply({
                content: `כבר יש לך טיקט: ${existing}`,
                ephemeral: true
            });
        }

        const channel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.id}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel]
                },
                {
                    id: interaction.user.id,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages
                    ]
                },
                {
                    id: SUPPORT_ROLE_ID,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages
                    ]
                }
            ]
        });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('close_ticket')
                .setLabel('סגור טיקט')
                .setStyle(ButtonStyle.Danger)
        );

        await channel.send({
            content: `שלום ${interaction.user}, הצוות יטפל בפנייה שלך בקרוב.`,
            components: [row]
        });

        await interaction.reply({
            content: `הטיקט נפתח: ${channel}`,
            ephemeral: true
        });
    }

    if (interaction.customId === 'close_ticket') {
        await interaction.reply('הטיקט ייסגר בעוד רגע.');
        await interaction.channel.delete();
    }
});

client.login(process.env.DISCORD_TOKEN);
