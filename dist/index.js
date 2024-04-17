import dotenv from "dotenv";
import DiscordJS, { ChannelType, Events, GatewayIntentBits } from "discord.js";
import express from "express";
import bodyParser from "body-parser";
import dayjs from "dayjs";
import { updateRow, writeDataToSheets } from "./utils/sheetOperations.js";
import { getTags } from "./constants/index.js";
// import { getOldThreads } from "./utils/getOldThreads.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
const client = new DiscordJS.Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});
client.login(process.env.BOT_TOKEN);
client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    // function to add old messages to the sheet
    // try {
    //   getOldThreads(process.env.CHANNEL_ID, client);
    // } catch (error) {
    //   console.log(error);
    // }
});
client.on("threadCreate", async (thread) => {
    if (thread.parent?.type === ChannelType.GuildForum &&
        thread.parentId === process.env.CHANNEL_ID) {
        const firstMessage = await thread.fetchStarterMessage();
        const message = firstMessage?.content || "";
        const author = firstMessage?.author.username || "";
        await writeDataToSheets(message, author, thread);
    }
});
client.on("threadUpdate", async (oldThread, newThread) => {
    const tags = newThread.appliedTags.map((tag) => getTags(tag));
    let updatedValues = {
        Tags: tags.join(", "),
    };
    try {
        if (tags.includes("Resolved")) {
            const lastMessage = await newThread.messages.fetch({ limit: 1 });
            const lastMessageAt = dayjs(lastMessage.first().createdTimestamp);
            const startDate = dayjs(oldThread.createdTimestamp);
            updatedValues["Closed On"] = lastMessageAt.format("DD/MM/YYYY HH:mm:ss");
            updatedValues["Resolution time"] = lastMessageAt.diff(startDate, "minutes");
        }
    }
    catch {
        console.log("Something went wrong");
    }
    updateRow(newThread, updatedValues);
});
//# sourceMappingURL=index.js.map