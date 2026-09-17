import './style.css';

const WEATHER_API = import.meta.env.VITE_WEATHER_API;
const DICT_API = import.meta.env.VITE_DICT_API;

var searchForm=document.getElementById("searchForm"),searchInput=document.getElementById("searchInput"),taskInput=document.getElementById("taskInput"),addTaskBtn=document.getElementById("addTaskBtn"),taskList=document.getElementById("taskList"),taskCount=document.getElementById("taskCount"),settingsBtn=document.getElementById("settingsBtn"),settingsPanel=document.getElementById("settingsPanel"),closeSettingsBtn=document.getElementById("closeSettingsBtn"),themeSelect=document.getElementById("themeSelect"),addLinkBtn=document.getElementById("addLinkBtn"),linkModal=document.getElementById("linkModal"),closeLinkModal=document.getElementById("closeLinkModal"),linkName=document.getElementById("linkName"),linkUrl=document.getElementById("linkUrl"),saveLinkBtn=document.getElementById("saveLinkBtn"),quickLinks=document.getElementById("quickLinks"),browserTabs=document.getElementById("browserTabs"),newTabBtn=document.getElementById("newTabBtn"),homeBtn=document.getElementById("homeBtn"),homePage=document.getElementById("homePage"),internalPage=document.getElementById("internalPage"),backHomeBtn=document.getElementById("backHomeBtn"),internalTitle=document.getElementById("internalTitle"),internalContent=document.getElementById("internalContent")

function escapeHTML(str){var div=document.createElement("div");div.textContent=str;return div.innerHTML}

function updateGreeting(){
var now=new Date(),h=now.getHours(),greeting="Good morning."
if(h>=12&&h<17)greeting="Good afternoon."
else if(h>=17)greeting="Good evening."
document.getElementById("greetingText").textContent=greeting
var days=["SUN","MON","TUE","WED","THU","FRI","SAT"]
var months=["JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE","JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"]
document.getElementById("dateDay").textContent=days[now.getDay()]
document.getElementById("dateNum").textContent=now.getDate()
document.getElementById("dateMonth").textContent=months[now.getMonth()]+" "+now.getFullYear()
}
updateGreeting()
setInterval(updateGreeting,60000)

searchForm.addEventListener("submit",function(event){event.preventDefault();var q=searchInput.value.trim();if(!q)return;createBrowserTab("search",q);searchInput.value=""})

var tasks=JSON.parse(localStorage.getItem("deskTasks"))||[]
function saveTasks(){localStorage.setItem("deskTasks",JSON.stringify(tasks))}
function renderTasks(){
taskList.innerHTML=""
var completed=tasks.filter(function(t){return t.completed}).length
taskCount.textContent=completed+" / "+tasks.length
if(tasks.length===0){var empty=document.createElement("p");empty.textContent="No assignments yet.";empty.style.color="#6a7080";empty.style.fontSize="10px";empty.style.padding="8px 0";taskList.appendChild(empty);return}
tasks.forEach(function(task){
var el=document.createElement("div");el.className="task"
if(task.completed)el.classList.add("completed")
el.innerHTML='<input type="checkbox" class="task-checkbox" '+(task.completed?"checked":"")+">"+"<span>"+escapeHTML(task.text)+"</span>"+'<button class="delete-task">&times;</button>'
el.querySelector(".task-checkbox").addEventListener("change",function(){task.completed=this.checked;saveTasks();renderTasks()})
el.querySelector(".delete-task").addEventListener("click",function(){tasks=tasks.filter(function(item){return item.id!==task.id});saveTasks();renderTasks()})
taskList.appendChild(el)
})}
function addTask(){var text=taskInput.value.trim();if(!text)return;tasks.push({id:Date.now(),text:text,completed:false});taskInput.value="";saveTasks();renderTasks()}
addTaskBtn.addEventListener("click",addTask)
taskInput.addEventListener("keydown",function(e){if(e.key==="Enter")addTask()})
renderTasks()

settingsBtn.addEventListener("click",function(){settingsPanel.classList.remove("hidden")})
closeSettingsBtn.addEventListener("click",function(){settingsPanel.classList.add("hidden")})
function applyTheme(theme){if(theme==="light"){document.body.classList.add("light")}else{document.body.classList.remove("light")}localStorage.setItem("deskTheme",theme)}
themeSelect.addEventListener("change",function(){applyTheme(themeSelect.value)})
var savedTheme=localStorage.getItem("deskTheme")||"dark";themeSelect.value=savedTheme;applyTheme(savedTheme)

var customLinks=JSON.parse(localStorage.getItem("deskLinks"))||[]
function saveCustomLinks(){localStorage.setItem("deskLinks",JSON.stringify(customLinks))}
function renderCustomLinks(){
document.querySelectorAll(".custom-link").forEach(function(l){l.remove()})
customLinks.forEach(function(link){
var el=document.createElement("a");el.className="link-card custom-link";el.href=link.url;el.target="_self"
el.innerHTML='<div class="link-icon">'+escapeHTML(link.name.substring(0,2).toUpperCase())+"</div>"+"<strong>"+escapeHTML(link.name)+"</strong>"
quickLinks.appendChild(el)
})}
function addCustomLink(){
var name=linkName.value.trim(),url=linkUrl.value.trim()
if(!name||!url){alert("Enter both a name and URL.");return}
if(!url.startsWith("http://")&&!url.startsWith("https://")){alert("URL must start with http:// or https://");return}
customLinks.push({name:name,url:url})
saveCustomLinks();linkName.value="";linkUrl.value="";linkModal.classList.add("hidden");renderCustomLinks()
}
addLinkBtn.addEventListener("click",function(){linkModal.classList.remove("hidden")})
closeLinkModal.addEventListener("click",function(){linkModal.classList.add("hidden")})
saveLinkBtn.addEventListener("click",addCustomLink)
renderCustomLinks()

var activeTab="home",browserPages={}

function createBrowserTab(type,query,url){
if(!type)type="new"
var tabId="tab-"+Date.now()
var title=type==="search"?"Search: "+query:type==="reward"?"Reward":"New Tab"
browserPages[tabId]={type:type,title:title,query:query||"",url:url||""}
var tab=document.createElement("button");tab.className="browser-tab";tab.dataset.tab=tabId
tab.innerHTML="<span>"+title+"</span>"+'<span class="close-tab">&times;</span>'
tab.addEventListener("click",function(event){if(event.target.classList.contains("close-tab")){closeBrowserTab(tabId);return}activateBrowserTab(tabId)})
browserTabs.insertBefore(tab,newTabBtn)
activateBrowserTab(tabId)
}

function activateBrowserTab(tabId){
activeTab=tabId
document.querySelectorAll(".browser-tab").forEach(function(tab){tab.classList.toggle("active",tab.dataset.tab===tabId)})
homePage.classList.remove("active-page");homePage.classList.add("hidden")
internalPage.classList.remove("hidden");internalPage.classList.add("active-page")
renderBrowserTabContent(tabId)
}

function closeBrowserTab(tabId){
var tab=document.querySelector('[data-tab="'+tabId+'"]'),wasActive=activeTab===tabId
if(tab)tab.remove()
delete browserPages[tabId]
if(wasActive){var remaining=Object.keys(browserPages);if(remaining.length>0)activateBrowserTab(remaining[remaining.length-1]);else activateHomeTab()}
}

function activateHomeTab(){
activeTab="home"
document.querySelectorAll(".browser-tab").forEach(function(tab){tab.classList.toggle("active",tab.dataset.tab==="home")})
internalPage.classList.remove("active-page");internalPage.classList.add("hidden")
homePage.classList.remove("hidden");homePage.classList.add("active-page")
}

newTabBtn.addEventListener("click",function(){createBrowserTab()})
homeBtn.addEventListener("click",function(){activateHomeTab()})
var homeTab=browserTabs.querySelector('[data-tab="home"]')
if(homeTab)homeTab.addEventListener("click",function(){activateHomeTab()})
backHomeBtn.addEventListener("click",function(){activateHomeTab()})

function renderBrowserTabContent(tabId){
var page=browserPages[tabId];if(!page)return
internalTitle.textContent=page.title
if(page.type==="search"&&page.query){renderGoogleSearch(page.query)}
else if(page.type==="reward"&&page.url){renderReward(page.url)}
else{renderNewBrowserPage(tabId)}
}

function renderNewBrowserPage(tabId){
internalContent.innerHTML='<div class="fake-browser-home">'+'<div class="fake-browser-logo">StudyDesk</div>'+"<h1>Search your study resources</h1>"+'<div class="fake-browser-search">'+'<input type="text" id="browserSearchInput" placeholder="Search...">'+'<button id="browserSearchBtn">Search</button>'+"</div></div>"
document.getElementById("browserSearchBtn").addEventListener("click",function(){var q=document.getElementById("browserSearchInput").value.trim();if(q)performSearch(tabId,q)})
document.getElementById("browserSearchInput").addEventListener("keydown",function(e){if(e.key==="Enter"){var q=e.target.value.trim();if(q)performSearch(tabId,q)}})
}

function performSearch(tabId,query){
var page=browserPages[tabId];page.type="search";page.title="Search: "+query;page.query=query
var tab=document.querySelector('[data-tab="'+tabId+'"]')
if(tab)tab.querySelector("span:first-child").textContent=page.title
renderGoogleSearch(query)
}

function renderGoogleSearch(query){
internalContent.innerHTML='<iframe src="https://www.google.com/search?igu=1&q='+encodeURIComponent(query)+'" style="width:100%;height:500px;border:0"></iframe>'
}

function renderReward(url){
internalContent.innerHTML='<iframe src="'+url+'" style="width:100%;height:500px;border:0"></iframe>'
}

document.querySelectorAll(".link-card:not(.custom-link)").forEach(function(link){
link.addEventListener("click",function(event){
event.preventDefault()
var name=link.querySelector("strong")
if(!name)return
createBrowserTab("search",name.textContent.trim())
})})

var notesArea=document.getElementById("notesArea"),clearNotesBtn=document.getElementById("clearNotesBtn")
notesArea.value=localStorage.getItem("deskNotes")||""
notesArea.addEventListener("input",function(){localStorage.setItem("deskNotes",notesArea.value)})
clearNotesBtn.addEventListener("click",function(){notesArea.value="";localStorage.removeItem("deskNotes")})

var weatherBox=document.getElementById("weatherBox"),weatherCity=document.getElementById("weatherCity"),weatherGoBtn=document.getElementById("weatherGoBtn")
function loadWeather(city){
weatherBox.textContent="loading..."
fetch(WEATHER_API+"/v1/search?name="+encodeURIComponent(city)+"&count=1")
.then(function(r){return r.json()}).then(function(geo){
if(!geo.results||geo.results.length===0){weatherBox.textContent="City not found.";return}
var lat=geo.results[0].latitude,lon=geo.results[0].longitude
return fetch(WEATHER_API+"/v1/forecast?latitude="+lat+"&longitude="+lon+"&current=temperature_2m,wind_speed_10m,relative_humidity_2m,weather_code")
}).then(function(r){if(r)return r.json()}).then(function(data){
if(!data||!data.current)return
var c=data.current
var code=c.weather_code;var desc="Unknown"
if(code===0)desc="Clear sky";else if(code<=3)desc="Cloudy";else if(code<=49)desc="Foggy";else if(code<=69)desc="Rainy";else if(code<=79)desc="Snowy";else if(code<=99)desc="Stormy"
weatherBox.innerHTML="<strong>"+c.temperature_2m+"&deg;C</strong> - "+desc+"<br>"+"Wind: "+c.wind_speed_10m+" km/h"+"&nbsp; Humidity: "+c.relative_humidity_2m+"%"
}).catch(function(){weatherBox.textContent="Could not load weather."})
}
weatherGoBtn.addEventListener("click",function(){var c=weatherCity.value.trim();if(c)loadWeather(c)})
weatherCity.addEventListener("keydown",function(e){if(e.key==="Enter"){var c=weatherCity.value.trim();if(c)loadWeather(c)}})

var dictWord=document.getElementById("dictWord"),dictGoBtn=document.getElementById("dictGoBtn"),dictResult=document.getElementById("dictResult")
function lookupWord(word){
dictResult.textContent="looking up..."
fetch(DICT_API+"/page/definition/"+encodeURIComponent(word))
.then(function(r){if(!r.ok)throw new Error("not found");return r.json()})
.then(function(data){
if(!data||!data.en||!data.en.length){dictResult.textContent="No results found.";return}
var html='<div class="dict-word">'+escapeHTML(word)+"</div>"
data.en.slice(0,3).forEach(function(m){
html+='<div class="dict-pos">'+escapeHTML(m.partOfSpeech)+"</div>"
m.definitions.slice(0,2).forEach(function(d){
var text=d.definition.replace(/<[^>]+>/g,"")
html+='<div class="dict-def">- '+escapeHTML(text)+"</div>"
})
})
dictResult.innerHTML=html
}).catch(function(){dictResult.textContent="Word not found."})
}
dictGoBtn.addEventListener("click",function(){var w=dictWord.value.trim();if(w)lookupWord(w)})
dictWord.addEventListener("keydown",function(e){if(e.key==="Enter"){var w=dictWord.value.trim();if(w)lookupWord(w)}})

var focusTopic=document.getElementById("focusTopic"),focusHours=document.getElementById("focusHours"),focusMins=document.getElementById("focusMins"),breakYes=document.getElementById("breakYes"),breakNo=document.getElementById("breakNo"),startFocusBtn=document.getElementById("startFocusBtn"),focusActive=document.getElementById("focusActive"),focusTopicDisplay=document.getElementById("focusTopicDisplay"),focusTimer=document.getElementById("focusTimer"),focusProgressBar=document.getElementById("focusProgressBar"),stopFocusBtn=document.getElementById("stopFocusBtn")
var focusRunning=false,focusInterval=null,focusTotalSeconds=0,focusSecondsLeft=0,focusReward="youtube"

document.getElementById("focusNext1").addEventListener("click",function(){document.getElementById("focusStep1").classList.add("hidden");document.getElementById("focusStep2").classList.remove("hidden")})
document.getElementById("focusNext2").addEventListener("click",function(){document.getElementById("focusStep2").classList.add("hidden");document.getElementById("focusStep3").classList.remove("hidden")})
document.getElementById("focusNext3").addEventListener("click",function(){document.getElementById("focusStep3").classList.add("hidden");document.getElementById("focusStep4").classList.remove("hidden")})

breakYes.addEventListener("click",function(){breakYes.classList.add("active");breakNo.classList.remove("active")})
breakNo.addEventListener("click",function(){breakNo.classList.add("active");breakYes.classList.remove("active")})

document.querySelectorAll(".reward-card").forEach(function(card){
card.addEventListener("click",function(){
document.querySelectorAll(".reward-card").forEach(function(c){c.classList.remove("active")})
card.classList.add("active")
focusReward=card.dataset.reward
})
})

startFocusBtn.addEventListener("click",function(){
var topic=focusTopic.value.trim()||"Study Session"
var hours=parseInt(focusHours.value)||0
var mins=parseInt(focusMins.value)||0
focusTotalSeconds=(hours*60+mins)*60
if(focusTotalSeconds<=0){alert("Set a time first.");return}
focusSecondsLeft=focusTotalSeconds
focusTopicDisplay.textContent="Focusing on: "+topic
document.querySelectorAll(".focus-step").forEach(function(s){s.classList.add("hidden")})
startFocusBtn.classList.add("hidden")
focusActive.classList.remove("hidden")
focusRunning=true
focusInterval=setInterval(function(){
focusSecondsLeft--
var m=Math.floor(focusSecondsLeft/60),s=focusSecondsLeft%60
focusTimer.textContent=(m<10?"0":"")+m+":"+(s<10?"0":"")+s
var pct=((focusTotalSeconds-focusSecondsLeft)/focusTotalSeconds)*100
focusProgressBar.style.width=pct+"%"
if(focusSecondsLeft<=0){clearInterval(focusInterval);focusRunning=false;focusComplete()}
},1000)
})

function focusComplete(){
focusTimer.textContent="DONE!"
focusProgressBar.style.width="100%"
stopFocusBtn.textContent="OPEN REWARD"
stopFocusBtn.style.background="#6c8cff"
stopFocusBtn.style.color="#fff"
stopFocusBtn.style.border="0"
}

stopFocusBtn.addEventListener("click",function(){
if(!focusRunning&&stopFocusBtn.textContent==="OPEN REWARD"){
var url=focusReward==="youtube"?"https://www.youtube.com/embed/D9lVNzyhYnc?si=VJ-4YXfUlyWY1Z-h":"https://bloxity.io/"
createBrowserTab("reward","",url)
resetFocus()
return
}
clearInterval(focusInterval);focusRunning=false;resetFocus()
})

function resetFocus(){
focusActive.classList.add("hidden")
document.getElementById("focusStep1").classList.remove("hidden")
focusProgressBar.style.width="0%"
focusTimer.textContent="00:00"
stopFocusBtn.textContent="STOP"
stopFocusBtn.style.background="transparent"
stopFocusBtn.style.color="#ff6b6b"
stopFocusBtn.style.border="1px solid #ff6b6b"
}
