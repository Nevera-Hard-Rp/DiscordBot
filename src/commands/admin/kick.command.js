import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'

export default {
    cooldown: 0,
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Wyrzuca gracza z serwera.')
        .addUserOption((option) =>
            option
                .setName('user')
                .setDescription('Użytkownik do wyrzucenia')
                .setRequired(true),
        )
        .addStringOption((option) =>
            option.setName('reason').setDescription('Powód wyrzucenia'),
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .setDMPermission(false),

    async execute(interaction) {
        // /kick <user> [reason]
        const targetUser = interaction.options.getUser('user')
        const reason =
            interaction.options.getString('reason') || 'Nie podano powodu'

        await interaction.deferReply()

        const commandMember = interaction.member
        const botMember = interaction.guild.members.me
        const targetMember = interaction.guild.members.cache.get(targetUser.id)

        if (!commandMember.permissions.has(PermissionFlagsBits.KickMembers)) {
            return interaction.editReply(
                'Nie masz uprawnień do wyrzucenia użytkowników.',
            )
        }

        if (!botMember.permissions.has(PermissionFlagsBits.KickMembers)) {
            return interaction.editReply(
                'Nie mam uprawnień do wyrzucenia użytkowników.',
            )
        }

        const targetHighestRolePosition = targetMember.roles.highest.position
        const commandHighestRolePosition = commandMember.roles.highest.position
        const botHighestRolePosition = botMember.roles.highest.position

        // console.log(
        //     commandHighestRolePosition,
        //     targetHighestRolePosition,
        //     botHighestRolePosition,
        // )

        if (targetHighestRolePosition >= botHighestRolePosition) {
            return interaction.editReply(
                'Nie mogę wyrzucić użytkownika o wyższej lub równej roli.',
            )
        }

        if (targetHighestRolePosition >= commandHighestRolePosition) {
            return interaction.editReply(
                'Nie możesz wyrzucić użytkownika o wyższej lub równej roli.',
            )
        }

        if (!targetMember.kickable) {
            return interaction.editReply('Nie mogę wyrzucić tego użytkownika!')
        }

        // console.log(commandMember)

        try {
            await targetMember.kick({ reason })

            await interaction.editReply(
                `Wyrzucono użytkownika ${targetMember.user.tag} z powodem: "${reason}"`,
            )
        } catch (error) {
            interaction.editReply(
                'Nie można wyrzycić użytkownika! Wystąpił błąd podczas wykonywania tej komendy. Skontaktuj się z deweloperem bota.',
            )
        }
    },
}
