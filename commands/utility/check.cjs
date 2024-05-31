const { ModalSubmitFields, SlashCommandBuilder } = require('discord.js');
const keys = require('../../keys.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('check')
		.setDescription('Check if the provided last.fm user has likely sleep scrobbled.')
		.addStringOption(option =>
			option.setName('user')
				.setDescription('The last.fm user to check. (DO NOT PUT IN DISCORD USERNAMES)')
				.setRequired(true))
}
