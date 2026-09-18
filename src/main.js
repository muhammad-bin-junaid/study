import './style.css';

const GEO_API = 'https://geocoding-api.open-meteo.com';
const FORECAST_API = 'https://api.open-meteo.com';
const DICT_API = 'https://en.wiktionary.org/api/rest_v1';

// ========== helpers ==========

function esc(s) {
  var d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

// ========== clock + greeting + date ==========

var clockEl = document.getElementById('liveClock');
var dateEl = document.getElementById('todayDate');
var greetEl = document.getElementById('greetingText');

var quotes = [
  ['"The secret of getting ahead is getting started."', 'Mark Twain'],
  ['"It always seems impossible until it is done."', 'Nelson Mandela'],
  ['"Education is the most powerful weapon you can use to change the world."', 'Nelson Mandela'],
  ['"The beautiful thing about learning is that nobody can take it away from you."', 'B.B. King'],
  ['"Success is not final, failure is not fatal: it is the courage to continue that counts."', 'Winston Churchill'],
  ['"The only way to do great work is to love what you do."', 'Steve Jobs'],
  ['"In the middle of difficulty lies opportunity."', 'Albert Einstein'],
  ['"What we learn with pleasure we never forget."', 'Alfred Mercier'],
  ['"The expert in anything was once a beginner."', 'Helen Hayes'],
  ['"Don\'t let what you cannot do interfere with what you can do."', 'John Wooden'],
  ['"You don\'t have to be great to start, but you have to start to be great."', 'Zig Ziglar'],
  ['"The mind is not a vessel to be filled, but a fire to be kindled."', 'Plutarch']
];

function pickQuote() {
  var idx = Math.floor(Math.random() * quotes.length);
  document.getElementById('quoteText').textContent = quotes[idx][0];
  document.getElementById('quoteAuthor').textContent = '— ' + quotes[idx][1];
}
pickQuote();

function tickClock() {
  var now = new Date();
  var h = now.getHours();
  var m = now.getMinutes();
  var s = now.getSeconds();
  clockEl.textContent =
    (h < 10 ? '0' : '') + h + ':' +
    (m < 10 ? '0' : '') + m + ':' +
    (s < 10 ? '0' : '') + s;

  var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  dateEl.textContent = days[now.getDay()] + ', ' + now.getDate() + ' ' + months[now.getMonth()] + ' ' + now.getFullYear();

  var greeting = 'Good morning.';
  if (h >= 12 && h < 17) greeting = 'Good afternoon.';
  else if (h >= 17) greeting = 'Good evening.';
  greetEl.textContent = greeting;
}
tickClock();
setInterval(tickClock, 1000);

// ========== search ==========

var searchForm = document.getElementById('searchForm');
var searchInput = document.getElementById('searchInput');

searchForm.addEventListener('submit', function (e) {
  e.preventDefault();
  var q = searchInput.value.trim();
  if (!q) return;
  createTab('search', q);
  searchInput.value = '';
});

// ========== tasks ==========

var taskInput = document.getElementById('taskInput');
var addTaskBtn = document.getElementById('addTaskBtn');
var taskList = document.getElementById('taskList');
var taskCount = document.getElementById('taskCount');

var tasks = JSON.parse(localStorage.getItem('sd_tasks')) || [];

function saveTasks() { localStorage.setItem('sd_tasks', JSON.stringify(tasks)); }

function renderTasks() {
  taskList.innerHTML = '';
  var done = tasks.filter(function (t) { return t.done; }).length;
  taskCount.textContent = done + ' / ' + tasks.length;

  if (tasks.length === 0) {
    var p = document.createElement('p');
    p.className = 'empty-msg';
    p.textContent = 'no assignments yet';
    taskList.appendChild(p);
    return;
  }

  tasks.forEach(function (t) {
    var el = document.createElement('div');
    el.className = 'one-task' + (t.done ? ' done' : '');
    el.innerHTML =
      '<input type="checkbox"' + (t.done ? ' checked' : '') + '>' +
      '<span class="t-text">' + esc(t.text) + '</span>' +
      '<button class="del-btn">&times;</button>';

    el.querySelector('input').addEventListener('change', function () {
      t.done = this.checked;
      saveTasks();
      renderTasks();
    });

    el.querySelector('.del-btn').addEventListener('click', function () {
      tasks = tasks.filter(function (x) { return x.id !== t.id; });
      saveTasks();
      renderTasks();
    });

    taskList.appendChild(el);
  });
}

function addTask() {
  var text = taskInput.value.trim();
  if (!text) return;
  tasks.push({ id: Date.now(), text: text, done: false });
  taskInput.value = '';
  saveTasks();
  renderTasks();
}

addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') addTask(); });
renderTasks();

// ========== settings / theme ==========

var settingsBtn = document.getElementById('settingsBtn');
var settingsPanel = document.getElementById('settingsPanel');
var closeSettingsBtn = document.getElementById('closeSettingsBtn');
var themeSelect = document.getElementById('themeSelect');

settingsBtn.addEventListener('click', function () { settingsPanel.classList.add('open'); });
closeSettingsBtn.addEventListener('click', function () { settingsPanel.classList.remove('open'); });

function applyTheme(t) {
  if (t === 'light') document.body.classList.add('light-mode');
  else document.body.classList.remove('light-mode');
  localStorage.setItem('sd_theme', t);
}

themeSelect.addEventListener('change', function () { applyTheme(themeSelect.value); });
var saved = localStorage.getItem('sd_theme') || 'dark';
themeSelect.value = saved;
applyTheme(saved);

// ========== custom bookmarks ==========

var addLinkBtn = document.getElementById('addLinkBtn');
var linkModal = document.getElementById('linkModal');
var closeLinkModal = document.getElementById('closeLinkModal');
var linkName = document.getElementById('linkName');
var linkUrl = document.getElementById('linkUrl');
var saveLinkBtn = document.getElementById('saveLinkBtn');
var quickLinks = document.getElementById('quickLinks');

var myLinks = JSON.parse(localStorage.getItem('sd_links')) || [];

function saveLinks() { localStorage.setItem('sd_links', JSON.stringify(myLinks)); }

function renderLinks() {
  document.querySelectorAll('.bmark.custom').forEach(function (l) { l.remove(); });
  myLinks.forEach(function (link) {
    var el = document.createElement('div');
    el.className = 'bmark custom';
    el.innerHTML = '<div class="bicon">' + esc(link.name.substring(0, 2).toUpperCase()) + '</div><span class="bname">' + esc(link.name) + '</span>';
    el.addEventListener('click', function () { createTab('search', link.name); });
    quickLinks.appendChild(el);
  });
}

function addLink() {
  var name = linkName.value.trim();
  var url = linkUrl.value.trim();
  if (!name || !url) { alert('fill in both fields'); return; }
  if (!url.startsWith('http://') && !url.startsWith('https://')) { alert('url needs http:// or https://'); return; }
  myLinks.push({ name: name, url: url });
  saveLinks();
  linkName.value = '';
  linkUrl.value = '';
  linkModal.classList.add('hidden');
  renderLinks();
}

addLinkBtn.addEventListener('click', function () { linkModal.classList.remove('hidden'); });
closeLinkModal.addEventListener('click', function () { linkModal.classList.add('hidden'); });
saveLinkBtn.addEventListener('click', addLink);
renderLinks();

// default bookmarks click
document.querySelectorAll('.bmark:not(.custom)').forEach(function (el) {
  el.addEventListener('click', function () {
    var name = el.querySelector('.bname');
    if (name) createTab('search', name.textContent.trim());
  });
});

// ========== tabs ==========

var activeTab = 'home';
var pages = {};
var browserTabs = document.getElementById('browserTabs');
var newTabBtn = document.getElementById('newTabBtn');
var homePage = document.getElementById('homePage');
var internalPage = document.getElementById('internalPage');
var backHomeBtn = document.getElementById('backHomeBtn');
var internalTitle = document.getElementById('internalTitle');
var internalContent = document.getElementById('internalContent');

function createTab(type, query, url) {
  if (!type) type = 'new';
  var id = 'tab-' + Date.now();
  var title = type === 'search' ? 'Search: ' + query : type === 'reward' ? 'Reward' : 'New Tab';
  pages[id] = { type: type, title: title, query: query || '', url: url || '' };

  var btn = document.createElement('button');
  btn.dataset.tab = id;
  btn.innerHTML = '<span>' + title + '</span>';
  btn.addEventListener('click', function (e) {
    if (e.target.classList.contains('close-tab')) return;
    openTab(id);
  });
  browserTabs.insertBefore(btn, newTabBtn);
  openTab(id);
}

function openTab(id) {
  activeTab = id;
  browserTabs.querySelectorAll('button').forEach(function (b) {
    b.classList.toggle('active', b.dataset.tab === id);
  });
  homePage.classList.remove('open');
  homePage.classList.add('hidden');
  internalPage.classList.remove('hidden');
  internalPage.classList.add('open');
  renderTabContent(id);
}

function goHome() {
  activeTab = 'home';
  browserTabs.querySelectorAll('button').forEach(function (b) {
    b.classList.toggle('active', b.dataset.tab === 'home');
  });
  internalPage.classList.remove('open');
  internalPage.classList.add('hidden');
  homePage.classList.remove('hidden');
  homePage.classList.add('open');
}

function renderTabContent(id) {
  var page = pages[id];
  if (!page) return;
  internalTitle.textContent = page.title;

  if (page.type === 'search' && page.query) {
    internalContent.innerHTML = '<iframe src="https://www.google.com/search?igu=1&q=' + encodeURIComponent(page.query) + '"></iframe>';
  } else if (page.type === 'reward' && page.url) {
    internalContent.innerHTML = '<iframe src="' + page.url + '"></iframe>';
  } else {
    internalContent.innerHTML =
      '<div class="browser-home">' +
      '<div class="bh-title">StudyDesk</div>' +
      '<h2>Search your study resources</h2>' +
      '<div class="bh-search">' +
      '<input type="text" id="browserSearchInput" placeholder="Search...">' +
      '<button id="browserSearchBtn">Search</button>' +
      '</div></div>';

    document.getElementById('browserSearchBtn').addEventListener('click', function () {
      var q = document.getElementById('browserSearchInput').value.trim();
      if (q) { page.type = 'search'; page.query = q; page.title = 'Search: ' + q; renderTabContent(id); }
    });
    document.getElementById('browserSearchInput').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var q = e.target.value.trim();
        if (q) { page.type = 'search'; page.query = q; page.title = 'Search: ' + q; renderTabContent(id); }
      }
    });
  }
}

newTabBtn.addEventListener('click', function () { createTab(); });
backHomeBtn.addEventListener('click', goHome);
var homeBtn = browserTabs.querySelector('[data-tab="home"]');
if (homeBtn) homeBtn.addEventListener('click', goHome);

// ========== notes ==========

var notesArea = document.getElementById('notesArea');
var clearNotesBtn = document.getElementById('clearNotesBtn');
notesArea.value = localStorage.getItem('sd_notes') || '';
notesArea.addEventListener('input', function () { localStorage.setItem('sd_notes', notesArea.value); });
clearNotesBtn.addEventListener('click', function () { notesArea.value = ''; localStorage.removeItem('sd_notes'); });

// ========== weather ==========

var weatherBox = document.getElementById('weatherBox');
var weatherCity = document.getElementById('weatherCity');
var weatherGoBtn = document.getElementById('weatherGoBtn');

function loadWeather(city) {
  weatherBox.textContent = 'loading...';
  fetch(GEO_API + '/v1/search?name=' + encodeURIComponent(city) + '&count=1')
    .then(function (r) { return r.json(); })
    .then(function (geo) {
      if (!geo.results || geo.results.length === 0) { weatherBox.textContent = 'city not found'; return; }
      var lat = geo.results[0].latitude;
      var lon = geo.results[0].longitude;
      return fetch(FORECAST_API + '/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&current=temperature_2m,wind_speed_10m,relative_humidity_2m,weather_code');
    })
    .then(function (r) { if (r) return r.json(); })
    .then(function (data) {
      if (!data || !data.current) return;
      var c = data.current;
      var code = c.weather_code;
      var desc = 'Unknown';
      if (code === 0) desc = 'Clear sky';
      else if (code <= 3) desc = 'Cloudy';
      else if (code <= 49) desc = 'Foggy';
      else if (code <= 69) desc = 'Rainy';
      else if (code <= 79) desc = 'Snowy';
      else if (code <= 99) desc = 'Stormy';
      weatherBox.innerHTML = '<strong>' + c.temperature_2m + '&deg;C</strong> — ' + desc +
        '<br>Wind ' + c.wind_speed_10m + ' km/h &middot; Humidity ' + c.relative_humidity_2m + '%';
    })
    .catch(function () { weatherBox.textContent = 'could not load weather'; });
}

weatherGoBtn.addEventListener('click', function () { var c = weatherCity.value.trim(); if (c) loadWeather(c); });
weatherCity.addEventListener('keydown', function (e) { if (e.key === 'Enter') { var c = weatherCity.value.trim(); if (c) loadWeather(c); } });

// ========== dictionary ==========

var dictWord = document.getElementById('dictWord');
var dictGoBtn = document.getElementById('dictGoBtn');
var dictResult = document.getElementById('dictResult');

function lookupWord(word) {
  dictResult.textContent = 'looking up...';
  fetch(DICT_API + '/page/definition/' + encodeURIComponent(word))
    .then(function (r) { if (!r.ok) throw new Error('nope'); return r.json(); })
    .then(function (data) {
      if (!data || !data.en || !data.en.length) { dictResult.textContent = 'no results'; return; }
      var html = '<div class="dict-word">' + esc(word) + '</div>';
      data.en.slice(0, 3).forEach(function (m) {
        html += '<div class="dict-pos">' + esc(m.partOfSpeech) + '</div>';
        m.definitions.slice(0, 2).forEach(function (d) {
          var txt = d.definition.replace(/<[^>]+>/g, '');
          html += '<div class="dict-def">- ' + esc(txt) + '</div>';
        });
      });
      dictResult.innerHTML = html;
    })
    .catch(function () { dictResult.textContent = 'word not found'; });
}

dictGoBtn.addEventListener('click', function () { var w = dictWord.value.trim(); if (w) lookupWord(w); });
dictWord.addEventListener('keydown', function (e) { if (e.key === 'Enter') { var w = dictWord.value.trim(); if (w) lookupWord(w); } });

// ========== focus timer ==========

var focusTopic = document.getElementById('focusTopic');
var focusHours = document.getElementById('focusHours');
var focusMins = document.getElementById('focusMins');
var breakYes = document.getElementById('breakYes');
var breakNo = document.getElementById('breakNo');
var startFocusBtn = document.getElementById('startFocusBtn');
var focusActive = document.getElementById('focusActive');
var focusTopicDisplay = document.getElementById('focusTopicDisplay');
var focusTimer = document.getElementById('focusTimer');
var focusProgressBar = document.getElementById('focusProgressBar');
var stopFocusBtn = document.getElementById('stopFocusBtn');

var timerRunning = false;
var timerInterval = null;
var totalSecs = 0;
var secsLeft = 0;
var rewardPick = 'youtube';

document.getElementById('focusNext1').addEventListener('click', function () {
  document.getElementById('focusStep1').classList.add('hidden');
  document.getElementById('focusStep2').classList.remove('hidden');
});

document.getElementById('focusNext2').addEventListener('click', function () {
  document.getElementById('focusStep2').classList.add('hidden');
  document.getElementById('focusStep3').classList.remove('hidden');
});

document.getElementById('focusNext3').addEventListener('click', function () {
  document.getElementById('focusStep3').classList.add('hidden');
  document.getElementById('focusStep4').classList.remove('hidden');
});

breakYes.addEventListener('click', function () { breakYes.classList.add('on'); breakNo.classList.remove('on'); });
breakNo.addEventListener('click', function () { breakNo.classList.add('on'); breakYes.classList.remove('on'); });

document.querySelectorAll('.rcard').forEach(function (card) {
  card.addEventListener('click', function () {
    document.querySelectorAll('.rcard').forEach(function (c) { c.classList.remove('picked'); });
    card.classList.add('picked');
    rewardPick = card.dataset.reward;
  });
});

startFocusBtn.addEventListener('click', function () {
  var topic = focusTopic.value.trim() || 'Study Session';
  var hrs = parseInt(focusHours.value) || 0;
  var mins = parseInt(focusMins.value) || 0;
  totalSecs = (hrs * 60 + mins) * 60;
  if (totalSecs <= 0) { alert('set a time first'); return; }
  secsLeft = totalSecs;
  focusTopicDisplay.textContent = 'Focusing on: ' + topic;

  document.querySelectorAll('.focus-step').forEach(function (s) { s.classList.add('hidden'); });
  startFocusBtn.classList.add('hidden');
  focusActive.classList.remove('hidden');
  timerRunning = true;

  timerInterval = setInterval(function () {
    secsLeft--;
    var mm = Math.floor(secsLeft / 60);
    var ss = secsLeft % 60;
    focusTimer.textContent = (mm < 10 ? '0' : '') + mm + ':' + (ss < 10 ? '0' : '') + ss;
    var pct = ((totalSecs - secsLeft) / totalSecs) * 100;
    focusProgressBar.style.width = pct + '%';
    if (secsLeft <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      focusTimer.textContent = 'DONE!';
      focusProgressBar.style.width = '100%';
      stopFocusBtn.textContent = 'OPEN REWARD';
      stopFocusBtn.style.background = '#f59e0b';
      stopFocusBtn.style.color = '#111827';
      stopFocusBtn.style.borderColor = '#f59e0b';
    }
  }, 1000);
});

stopFocusBtn.addEventListener('click', function () {
  if (!timerRunning && stopFocusBtn.textContent === 'OPEN REWARD') {
    var url = rewardPick === 'youtube'
      ? 'https://www.youtube.com/embed/D9lVNzyhYnc?si=VJ-4YXfUlyWY1Z-h'
      : 'https://bloxity.io/';
    createTab('reward', '', url);
    resetTimer();
    return;
  }
  clearInterval(timerInterval);
  timerRunning = false;
  resetTimer();
});

function resetTimer() {
  focusActive.classList.add('hidden');
  document.getElementById('focusStep1').classList.remove('hidden');
  focusProgressBar.style.width = '0%';
  focusTimer.textContent = '00:00';
  stopFocusBtn.textContent = 'STOP';
  stopFocusBtn.style.background = 'transparent';
  stopFocusBtn.style.color = '#ef4444';
  stopFocusBtn.style.borderColor = '#ef4444';
}
