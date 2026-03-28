const axios = require("axios");
const RPC = require("discord-rpc");

const JELLYFIN_URL = "DEINE_JELLYFIN_URL";
const API_KEY = "DEIN_JELLYFIN_API_KEY";
const USER_ID = "DEIN_JELLYFIN_USER_ID";
const CLIENT_ID = "DEINE_DISCORD_BOT_ID";

RPC.register(CLIENT_ID);
const rpc = new RPC.Client({ transport: "ipc" });

let currentItemId = null;
let startTimestamp = null;

function getYouTubeSearchUrl(title, artist) {
    const query = encodeURIComponent(`${artist} - ${title} official audio`);
    return `https://www.youtube.com/results?search_query=${query}`;
}

async function getNowPlaying() {
    try {
        const res = await axios.get(`${JELLYFIN_URL}/Sessions`, {
            headers: { "X-Emby-Token": API_KEY },
            timeout: 5000
        });

        const session = res.data.find(
            s => s.UserId === USER_ID && s.NowPlayingItem
        );

        if (!session) return null;

        const item = session.NowPlayingItem;
        const position = session.PlayState.PositionTicks / 10000000;
        const duration = item.RunTimeTicks / 10000000;

        if (currentItemId !== item.Id) {
            currentItemId = item.Id;
            startTimestamp = Date.now() - (position * 1000);
        }

        const type = item.Type;

        let data = {
            type,
            title: item.Name,
            duration,
            position,
            imageId: item.Id
        };

        if (type === "Audio") {
            data.artist = item.Artists?.join(", ") || item.AlbumArtist || "Unbekannter Künstler";
            data.album = item.Album || "Unbekanntes Album";
        }

        if (type === "Episode") {
            data.series = item.SeriesName;
            data.season = item.ParentIndexNumber;
            data.episode = item.IndexNumber;
        }

        if (type === "Movie") {
            data.year = item.ProductionYear;
        }

        return data;

    } catch (err) {
        console.error("Fehler:", err.message);
        return null;
    }
}

function getCoverUrl(imageId) {
    return `${JELLYFIN_URL}/Items/${imageId}/Images/Primary?api_key=${API_KEY}`;
}

async function updatePresence() {
    const data = await getNowPlaying();

    if (!data) {
        rpc.clearActivity();
        currentItemId = null;
        startTimestamp = null;
        console.log("⏸️ Nichts wird abgespielt");
        return;
    }

    console.log(`▶️ ${data.title} (${data.type})`);

    try {
        let activity = {
            startTimestamp: startTimestamp,
            endTimestamp: startTimestamp + (data.duration * 1000),
            largeImageKey: getCoverUrl(data.imageId),
            instance: false
        };

        // 🎵 Musik
        if (data.type === "Audio") {
            activity.details = data.title;
            activity.state = data.artist;

            activity.largeImageText = `${data.title} • ${data.album}`;

            activity.smallImageKey = "music";
            activity.smallImageText = "Listening to Music";

            activity.buttons = [
                {
                    label: "🎧 Auf YouTube hören",
                    url: getYouTubeSearchUrl(data.title, data.artist)
                }
            ];
        }

        // 📺 Serien
        else if (data.type === "Episode") {
            activity.details = data.series;
            activity.state = `S${data.season}E${data.episode} • ${data.title}`;

            activity.largeImageText = `${data.series}`;

            activity.smallImageKey = "tv";
            activity.smallImageText = "Watching Series";
        }

        // 🎬 Filme
        else if (data.type === "Movie") {
            activity.details = data.title;
            activity.state = data.year ? `Film (${data.year})` : "Film";

            activity.largeImageText = data.title;

            activity.smallImageKey = "movie";
            activity.smallImageText = "Watching Movie";
        }

        // ▶️ Sonstige Videos
        else {
            activity.details = data.title;
            activity.state = "Watching";

            activity.smallImageKey = "video";
            activity.smallImageText = "Watching Video";
        }

        await rpc.setActivity(activity);

    } catch (err) {
        console.error("RPC Fehler:", err.message);
    }
}

rpc.on("ready", () => {
    console.log("✅ Jellyfin RPC läuft!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    updatePresence();
    setInterval(updatePresence, 5000);
});

rpc.on("disconnected", () => {
    console.log("⚠️ Verbindung verloren...");
    setTimeout(() => {
        rpc.login({ clientId: CLIENT_ID }).catch(console.error);
    }, 5000);
});

// Start
rpc.login({ clientId: CLIENT_ID }).catch(err => {
    console.error("❌ Fehler:", err.message);
});

// Shutdown
process.on("SIGINT", () => {
    console.log("\n🛑 Stoppe RPC...");
    rpc.clearActivity();
    rpc.destroy();
    process.exit();
});
