const TESTING = true;

const TIMEOUT_DURATION = TESTING ? 6000 : 10 * 60 * 1000;
const INTERVAL_DURATION = TESTING ? 10000 : 10 * 60 * 1000;

let timerStarted = false;
let intervalId = null;
let minutesWatched = 0;

chrome.storage.local.get(["watchHistory"], (result) => {
  const watchHistory = result.watchHistory || [];
  console.log("🔁 Restored watchHistory:", watchHistory);

  // Get today's date
  const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD

  // Check if today's watch history exists
  const todayHistory = watchHistory.find((entry) => entry.date === today);
  if (todayHistory) {
    // Set minutesWatched to today's value if available
    minutesWatched = todayHistory.minutes;
  }

  // Update the badge text with the current minutesWatched
  chrome.browserAction.setBadgeText({
    text: Math.floor(minutesWatched).toString(),
  });
});

function startWatchTimer() {
  if (!timerStarted) {
    timerStarted = true;
    console.log(`⏳ Timer started for ${TIMEOUT_DURATION / 1000} seconds.`);

    if (intervalId) clearInterval(intervalId);

    intervalId = setInterval(() => {
      minutesWatched += TESTING ? 0.166 : 10; // 0.166 minutter = 10 sekunder (test)
      console.log(`🕒 Minutes watched: ${minutesWatched.toFixed(1)}`);

      chrome.storage.local.set({ minutesWatched });
      chrome.browserAction.setBadgeText({
        text: Math.floor(minutesWatched).toString(),
      });
    }, INTERVAL_DURATION);


     setTimeout(() => {
      chrome.storage.local.get(["minutesWatched"], (result) => {
        const storedMinutesWatched = result.minutesWatched || 0;

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const tab = tabs[0];
          if (tab?.id) {
            // Send the minutesWatched to the content script
            chrome.tabs.sendMessage(tab.id, {
              action: "pauseAndConfirm",
              minutesWatched: storedMinutesWatched,
            }, (response) => {
              if (chrome.runtime.lastError) {
                console.error("Failed to send message:", chrome.runtime.lastError);
              } else {
                console.log("📨 Sent pauseAndConfirm to contentscript", tab.id);
              }
            });
          } else {
            console.error("No active tab found");
          }
        });

        // Store the watch history for today
        const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
        chrome.storage.local.get(["watchHistory"], (result) => {
          const watchHistory = result.watchHistory || [];
          const todayIndex = watchHistory.findIndex(
            (entry) => entry.date === today
          );

          // Update or add the minutes watched for today
          if (todayIndex !== -1) {
            watchHistory[todayIndex].minutes = storedMinutesWatched;
          } else {
            watchHistory.push({ date: today, minutes: storedMinutesWatched });
          }

          // Save the updated watchHistory to storage
          chrome.storage.local.set({ watchHistory });
        });
      });

      // Stop the timer after sending the data
      timerStarted = false;
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
