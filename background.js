let timerStarted = false;

function startWatchTimer() {
  if (!timerStarted) {
    timerStarted = true;
    console.log("⏳ Timer started for 2 seconds.");
    setTimeout(() => {
      // Pause video first in a separate stack
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, { action: "pauseVideo" });
          console.log("⏸️ YouTube Shorts video pause requested.");

          // Give it a short moment to execute before blocking prompt
          setTimeout(() => {
            const userResponse = confirm(
              "You have been watching YouTube Shorts for 10 minutes. Do you want to do something else?"
            );
            if (userResponse) {
              console.log("✅ User wants to do something else.");
            } else {
              console.log("▶️ User wants to continue watching.");
              chrome.tabs.sendMessage(tab.id, { action: "startVideo" });
            }
            timerStarted = false;
          }, 100); // short delay ensures message is sent before blocking
        }
      });
    }, 600000);
  }
}

// Listen for URL changes with chrome.tabs.onUpdated
chrome.tabs.onUpdated.addListener(( tab) => {

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
