const axios = require("axios");
const RPC = require("discord-rpc");
const notifier = require("node-notifier");
const path = require("path");

const JELLYFIN_URL = "JELLYFIN URL";
const API_KEY = "JELLYFIN API KEY";
const USER_ID = "JELLYFIN USER ID";
const CLIENT_ID = "DISCORD BOT CLIENT ID";

RPC.register(CLIENT_ID);
const rpc = new RPC.Client({ transport: "ipc" });

let currentItemId = null;
let startTimestamp = null;
let isRunning = true;

// Konsolen-Farben für bessere Sichtbarkeit
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m"
};

// Clear console und zeige Banner
function showBanner() {
    console.clear();
    console.log(`${colors.bright}${colors.red}╔══════════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.bright}${colors.red}║${colors.reset}                                                          ${colors.bright}${colors.red}║${colors.reset}`);
    console.log(`${colors.bright}${colors.red}║${colors.reset}     ${colors.bright}${colors.yellow}JELLYFIN DISCORD RPC - AKTIV${colors.reset}                     ${colors.bright}${colors.red}║${colors.reset}`);
    console.log(`${colors.bright}${colors.red}║${colors.reset}                                                          ${colors.bright}${colors.red}║${colors.reset}`);
    console.log(`${colors.bright}${colors.red}╠══════════════════════════════════════════════════════════════╣${colors.reset}`);
    console.log(`${colors.bright}${colors.red}║${colors.reset}                                                          ${colors.bright}${colors.red}║${colors.reset}`);
    console.log(`${colors.bright}${colors.red}║${colors.reset}  ${colors.bright}${colors.red}⚠️  WARNUNG - DIESES FENSTER NICHT SCHLIEßEN!  ⚠️${colors.reset}      ${colors.bright}${colors.red}║${colors.reset}`);
    console.log(`${colors.bright}${colors.red}║${colors.reset}                                                          ${colors.bright}${colors.red}║${colors.reset}`);
    console.log(`${colors.bright}${colors.red}║${colors.reset}  ${colors.yellow}Wenn du dieses Fenster schließt, funktioniert${colors.reset}         ${colors.bright}${colors.red}║${colors.reset}`);
    console.log(`${colors.bright}${colors.red}║${colors.reset}  ${colors.yellow}der Discord Rich Presence nicht mehr!${colors.reset}                 ${colors.bright}${colors.red}║${colors.reset}`);
    console.log(`${colors.bright}${colors.red}║${colors.reset}                                                          ${colors.bright}${colors.red}║${colors.reset}`);
    console.log(`${colors.bright}${colors.red}║${colors.reset}  → ${colors.green}Minimiere dieses Fenster einfach in die Taskleiste${colors.reset}    ${colors.bright}${colors.red}║${colors.reset}`);
    console.log(`${colors.bright}${colors.red}║${colors.reset}  → ${colors.green}Das Programm läuft im Hintergrund weiter${colors.reset}              ${colors.bright}${colors.red}║${colors.reset}`);
    console.log(`${colors.bright}${colors.red}║${colors.reset}                                                          ${colors.bright}${colors.red}║${colors.reset}`);
    console.log(`${colors.bright}${colors.red}╚══════════════════════════════════════════════════════════════╝${colors.reset}`);
    console.log(`\n${colors.cyan}📡 Status:${colors.reset} ${colors.green}Verbinde mit Discord...${colors.reset}\n`);
}

// Windows-Benachrichtigung senden
function sendNotification(title, message, type = "info") {
    try {
        notifier.notify({
            title: title,
            message: message,
            icon: path.join(__dirname, "icon.ico"),
            sound: true,
            wait: false,
            timeout: 5
        });
    } catch (err) {
        // Ignoriere Benachrichtigungsfehler
    }
}

// Status in Konsole anzeigen
function showStatus(data) {
    if (!data) {
        console.log(`${colors.yellow}⏸️  ${new Date().toLocaleTimeString()} - Nichts wird abgespielt${colors.reset}`);
        return;
    }

    const time = new Date().toLocaleTimeString();
    
    if (data.type === "Audio") {
        console.log(`${colors.green}🎵 ${time} - Spielt: ${colors.bright}${data.title}${colors.reset} ${colors.cyan}von ${data.artist}${colors.reset}`);
    } else if (data.type === "Episode") {
        console.log(`${colors.green}📺 ${time} - Spielt: ${colors.bright}${data.series}${colors.reset} ${colors.cyan}S${data.season}E${data.episode} - ${data.title}${colors.reset}`);
    } else if (data.type === "Movie") {
        console.log(`${colors.green}🎬 ${time} - Spielt: ${colors.bright}${data.title}${colors.reset} ${colors.cyan}(${data.year})${colors.reset}`);
    } else {
        console.log(`${colors.green}▶️  ${time} - Spielt: ${colors.bright}${data.title}${colors.reset}`);
    }
}

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
        console.error(`${colors.red}❌ Fehler beim Abrufen: ${err.message}${colors.reset}`);
        return null;
    }
}

function getCoverUrl(imageId) {
    return `${JELLYFIN_URL}/Items/${imageId}/Images/Primary?api_key=${API_KEY}`;
}

async function updatePresence() {
    const data = await getNowPlaying();
    
    if (data) {
        showStatus(data);
    } else {
        if (currentItemId !== null) {
            console.log(`${colors.yellow}⏸️  ${new Date().toLocaleTimeString()} - Wiedergabe gestoppt${colors.reset}`);
            currentItemId = null;
            startTimestamp = null;
        }
    }

    if (!data) {
        rpc.clearActivity();
        return;
    }

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
        console.error(`${colors.red}❌ RPC Fehler: ${err.message}${colors.reset}`);
    }
}

// Hauptprogramm
async function main() {
    showBanner();
    
    // Windows-Benachrichtigung beim Start
    sendNotification("Jellyfin Discord RPC", "Das Programm wurde erfolgreich gestartet und läuft im Hintergrund.", "info");
    
    rpc.on("ready", () => {
        console.log(`${colors.green}✅ Discord RPC verbunden!${colors.reset}`);
        console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
        updatePresence();
        setInterval(updatePresence, 5000);
    });

    rpc.on("disconnected", () => {
        console.log(`${colors.red}⚠️  Verbindung zu Discord verloren... Versuche neu zu verbinden...${colors.reset}`);
        setTimeout(() => {
            rpc.login({ clientId: CLIENT_ID }).catch(console.error);
        }, 5000);
    });

    // Start
    await rpc.login({ clientId: CLIENT_ID }).catch(err => {
        console.error(`${colors.red}❌ Fehler: ${err.message}${colors.reset}`);
        console.log(`${colors.yellow}💡 Stelle sicher, dass Discord geöffnet ist!${colors.reset}`);
        sendNotification("Jellyfin Discord RPC - Fehler", `Verbindungsfehler: ${err.message}`, "error");
        
        // Bei Fehler nicht beenden, sondern weiter versuchen
        setTimeout(() => {
            rpc.login({ clientId: CLIENT_ID }).catch(console.error);
        }, 10000);
    });
}

// Shutdown abfangen
process.on("SIGINT", () => {
    console.log(`\n${colors.yellow}🛑  Beende Programm...${colors.reset}`);
    sendNotification("Jellyfin Discord RPC", "Das Programm wurde beendet.", "info");
    rpc.clearActivity();
    rpc.destroy();
    process.exit();
});

// Programm starten
main();
