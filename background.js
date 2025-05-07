const TESTING = true;

const TIMEOUT_DURATION = TESTING ? 6000 : 10 * 60 * 1000;
const INTERVAL_DURATION = TESTING ? 10000 : 10 * 60 * 1000;

let timerStarted = false;
let intervalId = null;
let minutesWatched = 0;
chrome.storage.local.get(["minutesWatched"], (result) => {
  minutesWatched = result.minutesWatched || 0;
  console.log(`🔁 Restored minutesWatched: ${minutesWatched}`);
  chrome.browserAction.setBadgeText({ text: Math.floor(minutesWatched).toString() });
});
chrome.browserAction.setBadgeBackgroundColor({ color: '#FF0000' });

function startWatchTimer() {
  if (!timerStarted) {
    timerStarted = true;
    console.log(`⏳ Timer started for ${TIMEOUT_DURATION / 1000} seconds.`);
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(() => {
      minutesWatched += TESTING ? 0.166 : 10; // 0.166 minutter = 10 sekunder (test)
      console.log(`🕒 Minutes watched: ${minutesWatched.toFixed(1)}`);
      chrome.storage.local.set({ minutesWatched });
      chrome.browserAction.setBadgeText({ text: Math.floor(minutesWatched).toString() });
    }, INTERVAL_DURATION);

    setTimeout(() => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (tab?.id) {
          chrome.tabs.sendMessage(tab.id, { action: "pauseAndConfirm", minutesWatched: minutesWatched });
          console.log("📨 Sent pauseAndConfirm to contentscript", tab.id);
        }
        timerStarted = false;
      });
    }, TIMEOUT_DURATION);
  }
}

// Listen for URL changes with chrome.tabs.onUpdated
chrome.tabs.onUpdated.addListener((tab) => {
  if (tab.url && tab.url.includes("youtube.com/shorts")) {
    console.log("📺 YouTube Shorts detected via URL:", tab.url);
    startWatchTimer();
  }
});

// Listen for history state changes (SPA navigation)
if (chrome.webNavigation && chrome.webNavigation.onHistoryStateUpdated) {
  chrome.webNavigation.onHistoryStateUpdated.addListener(
    (details) => {
      console.log("History state updated:", details);
      chrome.tabs.get(details.tabId, (tab) => {
        if (tab.url && tab.url.includes("youtube.com/shorts")) {
          console.log("📺 YouTube Shorts detected via SPA nav:", tab.url);
          startWatchTimer();
        }
      });
    },
    {
      url: [{ hostContains: "youtube.com" }],
    }
  );
} else {
  console.error(
    "❌ webNavigation API not available. Check manifest permissions."
  );
}
