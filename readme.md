# StudyDesk

basically a new tab page i made for myself to stay focused while studying. you can set it as your browser's new tab and it has everything you need in one place.

## what it does

- **clock + greeting** — shows the time and changes greeting based on time of day
- **motivational quotes** — random quote on each page load
- **focus timer** — set a topic, duration, pick a reward, and start working. timer counts down and opens your reward when done
- **assignments** — add tasks, check them off when done. stays saved in your browser
- **quick notes** — jot stuff down, it persists in localStorage
- **weather** — type any city and get current temp, wind, humidity
- **dictionary** — look up any word, shows definitions
- **bookmarks** — wikipedia and scholar are default, add your own
- **browser tabs** — search anything, opens in an embedded google tab
- **spotify** — focus music player at the bottom
- **dark/light theme** — toggle in settings

## how to run locally

```
git clone https://github.com/muhammad-bin-junaid/study.git
cd study
npm install
npm run dev
```

then open http://localhost:5173

## tech

- plain html, css, javascript (no frameworks)
- vite for dev server and builds
- APIs: open-meteo for weather, wiktionary for dictionary
- spotify embed for music
- github actions for auto deploy
- all data saved in browser localStorage

## deployment

push to main and github actions handles the rest. also configured for vercel.

## live

https://muhammad-bin-junaid.github.io/study/
