document.addEventListener("DOMContentLoaded", () => {
  const statusElement = document.getElementById("status");
  const startTimerBtn = document.getElementById("startTimerBtn");

  // Function to update status
  function updateStatus(statusText) {
    statusElement.textContent = statusText;
  }

  // Check if user is currently on YouTube Shorts and update status
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs[0]?.url;

    if (url && url.includes("youtube.com/shorts")) {
      updateStatus("YouTube Shorts detected!");
    } else {
      updateStatus("Not on YouTube Shorts.");
    }
  });
});

chrome.storage.local.get(["watchHistory"], (result) => {
  const watchHistory = result.watchHistory || [];
  const historyContainer = document.getElementById("history-container"); // En div i din HTML

  if (watchHistory.length === 0) {
    historyContainer.innerHTML = "No watch history available.";
  } else {
    watchHistory.forEach((entry) => {
      const historyElement = document.createElement("div");
      const minutes = Math.floor(entry.minutes);
      historyElement.textContent = `${entry.date}: ${minutes} minutes`;
      historyContainer.appendChild(historyElement);
    });
  }
});
