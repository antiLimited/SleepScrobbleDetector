const { SlashCommandBuilder } = require('discord.js');
const { lastfmAPIkey } = require('../keys.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('check')
		.setDescription('Check if the provided last.fm user has likely sleep scrobbled.')
		.addStringOption(option =>
			option.setName('user')
				.setDescription('The last.fm user to check. (DO NOT PUT IN DISCORD USERNAMES)')),
	async execute(interaction) {
		// interaction.user is the object representing the User who ran the command
		// interaction.member is the GuildMember object, which represents the user in the specific guild
		await interaction.reply("fuck off");
	},
};