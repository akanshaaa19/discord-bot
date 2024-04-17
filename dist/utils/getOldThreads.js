import dayjs from "dayjs";
import { jsonToCsv } from "./jsonToCsv.js";
import { getTags } from "../constants/index.js";
export const getOldThreads = async (channelId, client) => {
    // Fetch the channel
    const channel = await client.channels.fetch(channelId);
    try {
        const threads = await channel.threads.fetch();
        const allMessagesCsv = await Promise.all(threads?.threads
            .filter((thread) => thread.parentId === channelId)
            .map(async (thread) => {
            let closedOn = "";
            let resolutionTime = "";
            const tags = thread.appliedTags.map((tag) => getTags(tag));
            if (tags.includes("Resolved")) {
                const lastMessage = await thread.messages.fetch({ limit: 1 });
                const lastMessageAt = dayjs(lastMessage.first().createdTimestamp);
                const startDate = dayjs(thread.createdTimestamp);
                closedOn = lastMessageAt.format("DD/MM/YYYY HH:mm:ss");
                resolutionTime = lastMessageAt.diff(startDate, "minutes");
            }
            return {
                id: thread.id,
                date: dayjs(thread.createdTimestamp).format("DD/MM/YYYY HH:mm:ss"),
                raisedBy: "",
                title: thread.name,
                query: "",
                tags: tags.join(","),
                total: "",
                responseTime: "",
                closedOn,
                resolutionTime,
            };
        }));
        jsonToCsv(allMessagesCsv);
    }
    catch (error) {
        console.log(error);
    }
};
//# sourceMappingURL=getOldThreads.js.map