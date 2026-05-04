# Gutshof Studio v3.5

KI-gestützter Instagram-Workflow für Gutshof-Restaurants. Foto rein, Caption raus, ganze Woche in 15 Minuten geplant.

## Was ist neu in v3.5

- ⏰ **3 Posting-Slots pro Tag** (Morgens / Mittags / Abends) — bis zu 21 Posts pro Woche
- 📤 **Meta Business Transfer-Wizard** — Vollbild-Modus, Post für Post: Bild speichern, Text kopieren, in Meta Business einfügen
- 📱 **Mobile-First** — größere Touch-Targets, iOS-Homescreen-Icon, Kamera-Direktzugriff

## Komplette Feature-Liste

### ✨ Generator
- Vision-KI: Claude analysiert dein Foto, schreibt darauf bezogene Captions
- 4 Strategie-Slider (Hook, Verkaufsdruck, Storytelling, Lokal-Bezug)
- 5 Ziel-Presets (Engagement, Reichweite, Reservierungen, Markenaufbau, Community)
- 8 Kategorien (Food, Event, Ambiente, Team, Saisonal, Getränke, Angebot, Sonntag)
- 3 Slot-Auswahl pro Tag mit individuell justierbarer Uhrzeit
- Emoji-Integration: 2-4 passende Emojis sinnvoll im Text platziert

### 💡 Ideen-Generator
- Schlägt 5/7/10/14/21 konkrete Post-Ideen vor
- Berücksichtigt Saison, bereits geplante Slots, Wochentag
- Schlägt automatisch passenden Slot vor (morning/noon/evening)
- Ein Klick → ins Generator-Briefing übernehmen

### 📅 Wochenplan mit 3 Slots/Tag
- 7-Tage-Kalender, sortiert nach Uhrzeit pro Tag
- Status-Tracking: Entwurf → Geplant → Veröffentlicht
- Detail-Modal mit Bild, Caption, Hashtags, Alt-Text
- Stats: Gesamt / Geplant / Live

**Optimale Zeit-Slots für deutsche Gastronomie:**

| Tag | 🌅 Morgens | ☀️ Mittags | 🌙 Abends |
|---|---|---|---|
| Mo | 10:30 | 12:30 | 18:30 |
| Di | 10:00 | 12:30 | 17:30 |
| Mi | 10:30 | 12:00 | 18:00 |
| Do | 10:30 | 13:00 | 18:00 |
| Fr | 11:00 | 12:30 | 17:00 |
| Sa | 09:30 | 12:00 | 18:30 |
| So | 09:30 | 12:00 | 17:30 |

Slot-Zwecke:
- **Morgens**: Lunch-Lockruf, Brunch-Suche, Tagesplanung
- **Mittags**: Crowd-Peak, Bergfest, Mittagspause
- **Abends**: Feierabend, Reservierung für morgen, Wochenend-Planung

### 📤 Meta Business Transfer-Wizard
Wenn deine Wochenplanung steht: ein Klick auf "📤 An Meta Business übertragen" öffnet einen **Vollbild-Wizard** der dich Post für Post durchgeht:

1. Großes Bild oben + Caption + Hashtags + Alt-Text + geplante Zeit
2. Zwei dicke Knöpfe: **"📥 Bild speichern"** (lädt JPG in deine Fotos) und **"⎘ Text kopieren"**
3. App-Switch zur Meta Business Suite App, neuen Post anlegen, Bild + Text einfügen, Datum/Uhrzeit aus dem Wizard übernehmen, planen
4. Zurück zum Wizard → "Nächster Post →"
5. Nach allen Posts: automatischer Status-Wechsel auf "Geplant"

Perfekt für mobile Nutzung am Handy. Du wechselst zwischen Gutshof Studio und Meta Business App hin und her.

### Mobile-Optimierungen
- Viewport-fit für iPhone-Notch
- Touch-Targets min. 44×44px (Apple HIG)
- iOS-Homescreen-Icon (auf Homescreen hinzufügen → wirkt wie eine App)
- Kamera-Direktzugriff beim Foto-Upload (iOS/Android)
- Adaptive Tab-Beschriftung (Icons + Text auf Desktop, nur Icons auf sehr kleinen Screens)
- Optimierte Slider mit größeren Thumbs für Touch

### CSV-Export
Zusätzlich für Desktop-User die lieber Bulk-Upload machen:
- Spalten: Tag, Datum, Uhrzeit, Slot, Kategorie, Caption, Hashtags, Alt-Text, Status
- Sortiert nach Tag + Zeit
- UTF-8 mit BOM für Excel-Kompatibilität

## Tech Stack

- Frontend: Vanilla HTML/CSS/JS (keine Build-Pipeline)
- Backend: Vercel Serverless Function
- Speicherung: Browser localStorage (keine Datenbank)
- KI: Anthropic Claude (Sonnet 4.6)

## Deployment auf Vercel

### Voraussetzungen
- GitHub Account (kostenlos)
- Vercel Account (kostenlos)
- Anthropic API Key ([console.anthropic.com](https://console.anthropic.com))

### Schritt 1 — GitHub Repo
1. [github.com](https://github.com) → "New repository"
2. Name: `gutshof-studio`, **Private** wählen
3. "Create repository"

### Schritt 2 — Dateien hochladen

**Web-Upload:**
- Im neuen Repo "uploading an existing file" klicken
- Alle Dateien aus dem ZIP-Ordner hochziehen
- Commit "Initial commit"

**Oder Git CLI:**
```bash
cd gutshof-vercel
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/DEIN-USERNAME/gutshof-studio.git
git push -u origin main
```

### Schritt 3 — Vercel Deploy
1. [vercel.com](https://vercel.com) → mit GitHub einloggen
2. "Add New..." → "Project" → Repo importieren
3. **Vor "Deploy":** Environment Variable setzen:
   - Name: `ANTHROPIC_API_KEY`
   - Value: dein Key (`sk-ant-...`)
4. "Deploy" klicken
5. Nach ~30 Sekunden: live auf `gutshof-studio.vercel.app`

### Schritt 4 — Auf Homescreen
**iPhone (Safari):** App öffnen → Teilen-Button → "Zum Home-Bildschirm"
**Android (Chrome):** App öffnen → Menü → "Zum Startbildschirm hinzufügen"

Danach hast du eine App-ähnliche Verknüpfung mit Logo und Vollbild.

---

## Empfohlener Workflow

**Sonntagabend, 15-20 Minuten:**

1. Tab "💡 Ideen" → 14 oder 21 Ideen generieren (2-3 Posts pro Tag)
2. Pro Idee: "→ Im Generator nutzen" → Foto aufnehmen/wählen → generieren → "📌 In Wochenplan speichern"
3. Tab "📅 Wochenplan" → "📤 An Meta Business übertragen"
4. Wizard durchgehen: Bild → Speichern → Text → Kopieren → Meta Business App → einfügen → planen → zurück
5. Nach 7-21 Posts: alles für die Woche geplant.

**Zeitaufwand: ~15-20 Min für eine ganze Woche.**

## Datenspeicherung

Posts werden im **Browser localStorage** gespeichert. Vorteile: kostenlos, schnell, keine Datenbank. Nachteil: Cache löschen = Posts weg. Vor Cache-Reset CSV exportieren.

## Updates

Push auf `main` → automatisches Re-Deploy.

## Kosten

- Vercel: kostenlos (Hobby-Plan)
- Anthropic API: ca. 0,5–1¢ pro Post
- 100 Posts/Monat ≈ 0,50–1,00 €

## Sicherheit

- API-Key liegt server-side bei Vercel (Environment Variable)
- Browser ruft nur eigenen `/api/generate` Endpoint
- Bilder werden nicht persistiert, nur durchgereicht

## Roadmap (nächste Updates)

Ausgewählt für die nächste Iteration:

- 🎬 **Story-Modus** — kürzere Texte, Frage-Sticker-Vorschläge, Polls, Quiz
- 🌦 **Wetterabhängige Vorschläge** — Standort-basiert (Open-Meteo), Regen → Soulfood, Sonne → Terrasse
- 🎄 **Anlass-Kalender** — Feiertage, Spargelsaison, Muttertag, Pfingsten, Brauchtum, kuriose Tage

Diese kommen nachdem du v3.5 getestet hast und Feedback zum Workflow gegeben hast.

## Lizenz

Privat — nicht zur Weitergabe.
