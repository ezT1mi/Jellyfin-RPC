
# 🎬 Jellyfin Discord Rich Presence

Zeigt auf Discord an, was du gerade auf deinem Jellyfin-Server schaust oder hörst. Unterstützt **Filme**, **Serien** und **Musik** mit individuellen Buttons und Icons.

![Demo](https://via.placeholder.com/800x200?text=Jellyfin+Discord+RPC+Demo)

## ✨ Features

* 🎵 **Musik** – Zeigt Titel, Künstler und Album an – mit YouTube-Link-Button
* 📺 **Serien** – Zeigt Serie, Staffel, Episode und Folgentitel
* 🎬 **Filme** – Zeigt Titel und Erscheinungsjahr
* 🖼️ **Cover-Bilder** – Zeigt das Primary-Image des aktuellen Titels
* ⏱️ **Fortschrittsanzeige** – Korrekte Start-/Endzeit basierend auf aktueller Position
* 🔄 **Automatische Aktualisierung** – Alle 5 Sekunden

## 📦 Voraussetzungen

* [Node.js](https://nodejs.org/) (v18 oder höher)
* Discord Client (muss geöffnet sein)
* Jellyfin Server (v10.8+ empfohlen)
* Jellyfin API-Key mit entsprechenden Rechten

## 🚀 Installation

### 1. Repository klonen
```bash
git clone [https://github.com/deinusername/jellyfin-rpc.git](https://github.com/deinusername/jellyfin-rpc.git)
cd jellyfin-rpc
````

### 2\. Abhängigkeiten installieren

```bash
npm install
```

### 3\. Konfiguration

Öffne `index.js` und ersetze die Platzhalter:

| Variable | Beschreibung |
| :--- | :--- |
| **JELLYFIN\_URL** | URL deines Jellyfin-Servers (z.B. `http://192.168.1.100:8096`) |
| **API\_KEY** | Jellyfin API-Key (in den Admin-Einstellungen erstellen) |
| **USER\_ID** | Deine Jellyfin-Benutzer-ID (findest du unter `/Users` im API-Browser) |
| **CLIENT\_ID** | Deine Discord Application ID (erstellt im Discord Developer Portal) |

### 4\. Discord Rich Presence aktivieren

Damit Discord-RPC funktioniert, musst du in deiner Discord Application unter **Rich Presence** → **Art Assets** die folgenden Icons hochladen:

  * `music`
  * `tv`
  * `movie`
  * `video`

-----

## 🎮 Ausführung

### Entwicklung

```bash
npm start
```

### Kompilierte EXE (Windows)

```bash
npm run build
```

Die ausführbare Datei findest du dann als `jellyfin-rpc.exe` im Projektverzeichnis.

-----

## 🔧 Konfigurationsbeispiel

```javascript
const JELLYFIN_URL = "[http://192.168.178.50:8096](http://192.168.178.50:8096)";
const API_KEY = "your-api-key-here";
const USER_ID = "a1b2c3d4e5f6g7h8i9j0";
const CLIENT_ID = "123456789012345678";
```

-----

## 📸 Screenshots

| Typ | Ansicht |
| :--- | :--- |
| 🎵 Musik |  |
| 📺 Serie |  |
| 🎬 Film |  |

-----

## 🛠️ Technische Details

  * **Framework:** Node.js
  * **Bibliotheken:**
      * `axios` – HTTP-Requests an die Jellyfin-API
      * `discord-rpc` – Discord Rich Presence Integration
  * **Aktualisierungsintervall:** 5 Sekunden
  * **Unterstützte Medientypen:** `Audio`, `Episode`, `Movie`

-----

## ❗ Fehlerbehebung

  * **"No such file or directory" / IPC-Fehler**
      * Stelle sicher, dass der Discord Client **geöffnet** ist.
      * Starte das Skript **nach** Discord.
  * **Keine Aktivität wird angezeigt**
      * Prüfe die API-Key-Berechtigungen.
      * Vergewissere dich, dass du in Jellyfin aktiv etwas abspielst.
      * Kontrolliere die Discord Application ID.
  * **Bild wird nicht geladen**
      * Jellyfin-URL muss von außen erreichbar sein (für Cover-Bilder).
      * Prüfe, ob der API-Key für Bild-Zugriff gültig ist.

-----

## 📁 Projektstruktur

```text
jellyfin-rpc/
├── index.js          # Hauptskript
├── package.json      # Abhängigkeiten und Scripts
└── README.md         # Dokumentation
```

## 📄 Lizenz

MIT License – Siehe `LICENSE` Datei

## 🙏 Credits

  * **Jellyfin** – Das Media-System
  * **discord-rpc** – Discord RPC Implementierung


⭐ **Bei Fragen oder Problemen einfach ein Issue auf GitHub erstellen\!**


