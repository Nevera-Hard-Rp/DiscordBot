import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'

export default {
    cooldown: 0,
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Wyrzuca gracza z serwera.')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption((option) =>
            option
                .setName('user')
                .setDescription('Użytkownik do wyrzucenia')
                .setRequired(true),
        )
        .addStringOption((option) =>
            option.setName('reason').setDescription('Powód wyrzucenia'),
        )
        .setDMPermission(false),

    async execute(interaction) {
        const commandUser = interaction.user
        const targetUser = interaction.options.getUser('user')
        const reason =
            interaction.options.getString('reason') || 'Brak podanego powodu.'

        await interaction.deferReply()

        const commandMember = interaction.member
        const botMember = interaction.guild.members.me
        const targetMember = await interaction.guild.members
            .fetch(targetUser.id)
            .catch((error) => {
                return null
            })

        if (targetMember == null) {
            interaction.editReply('Użytkownik nie jest członkiem tej gildii!')
            return
        }

        // Sprawdź, czy użytkownik próbuje wyrzucić samego siebie
        if (targetUser.id === commandUser.id) {
            return interaction.editReply('Nie możesz wyrzucić samego siebie.')
        }

        // Sprawdź, czy użytkownik próbuje wyrzucić tego bota
        if (targetUser.id === interaction.client.user.id) {
            return interaction.editReply('Nie mogę wyrzucić samego siebie.')
        }

        // Sprawdź uprawnienia użytkownika
        if (!commandMember.permissions.has(PermissionFlagsBits.KickMembers)) {
            return interaction.editReply(
                'Nie masz uprawnień do wyrzucenia użytkowników.',
            )
        }

        // Sprawdź uprawnienia bota
        if (!botMember.permissions.has(PermissionFlagsBits.KickMembers)) {
            return interaction.editReply(
                'Bot nie ma uprawnień do wyrzucenia użytkowników.',
            )
        }

        const targetHighestRolePosition = targetMember.roles.highest.position
        const commandMemberHighestRolePosition =
            commandMember.roles.highest.position
        const botHighestRolePosition =
            interaction.guild.members.me.roles.highest.position

        // console.log(
        //     commandMemberHighestRolePosition,
        //     targetHighestRolePosition,
        //     botHighestRolePosition,
        // )

        if (targetHighestRolePosition >= botHighestRolePosition) {
            return interaction.editReply(
                'Nie mogę wyrzucić użytkownika o wyższej lub równej roli.',
            )
        }

        // Właściciel serwera zawsze może wyrzucić użytkownika
        if (interaction.user.id === interaction.guild.ownerId) {
            console.log('Komenda uzyta przez wlasciciela serwera!')
            // Wyrzuć użytkownika
            return await this.kick(interaction, targetMember, reason)
        }

        if (targetHighestRolePosition >= commandMemberHighestRolePosition) {
            return interaction.editReply(
                'Nie możesz wyrzucić użytkownika o wyższej lub równej roli.',
            )
        }

        if (!targetMember.kickable) {
            return interaction.editReply('Nie mogę wyrzucić tego użytkownika.')
        }

        // Wyrzuć użytkownika
        await this.kick(interaction, targetMember, reason)
    },

    async kick(interaction, targetMember, reason) {
        try {
            await targetMember.kick({ reason })

            await interaction.editReply(
                `Wyrzucono użytkownika ${targetMember.user.tag} z powodem: "${reason}"`,
            )
        } catch (error) {
            interaction.reply(
                'Nie można wyrzycić użytkownika! Wystąpił błąd podczas wykonywania tej komendy. Skontaktuj się z deweloperem bota.',
            )
        }
    },
}
