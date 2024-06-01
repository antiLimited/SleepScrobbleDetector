import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import keys from "./keys.json" assert {type: "json"};
import SimpleFM from '@solely/simple-fm';

const lastclient = new SimpleFM(keys.lastfmAPIkey);

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.cjs'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = await import(filePath);
		client.commands.set(command.data.name, command);
	}
}

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		const username = interaction.options.getString("user");
		const userinfo = await lastclient.user.getInfo({username: username});
		const pageCount = Math.ceil(userinfo.stats.playCount / 200)
		await interaction.reply("Indexing "+userinfo.name+"'s scrobbles... 0/"+pageCount+" pages indexed.");

		// Indexing track times (UTS)
		let trackList = []
		for (let p = 0; p < pageCount; p++) {
			const pageNumber = p + 1
			const page = await lastclient.user.getRecentTracks({username: username, limit: 200, page: pageNumber})
			for (let s = 0; s < 200; s++) {
				if (page.tracks[s] != undefined) {
					trackList.push(Date.parse(page.tracks[s].dateAdded))
				}
			}
			await interaction.editReply("Indexing "+userinfo.name+"'s scrobbles... "+pageNumber+"/"+pageCount+" pages indexed.")
		}
		console.log(trackList)
		await interaction.followUp("Indexing complete!")

		// Initial streak forming
		let streakList = []
		let tempStreak = []
		for (let i = 0; i < trackList.length; i++) {
			if (trackList[i] != NaN) {
				if (trackList[i] - 1800000 <= trackList[i+1]) {
					tempStreak.push(trackList[i+1])
				} else {
					streakList.push(tempStreak)
					tempStreak = []
					tempStreak.push(trackList[i+1])
				}
			}
		}
		console.log(streakList.length)

		// Streak trimmer
		let trimmedStreakList = []
		for (let i = 0; i < streakList.length; i++) {
			if (streakList[i][0] - 14400000 >= streakList[i][streakList[i].length - 1]) {
				trimmedStreakList.push(streakList[i])
			}
		}
		console.log(trimmedStreakList)
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

// Log in to Discord with your client's token
client.login(keys.token);
