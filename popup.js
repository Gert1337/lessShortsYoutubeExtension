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

function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  const secs = Math.floor((minutes - Math.floor(minutes)) * 60);
  return `${hours}h ${mins}m ${secs}s`;
}

chrome.storage.local.get(["minutesWatched", "watchHistory"], (result) => {
  const minutesWatched = result.minutesWatched || 0;
  const watchHistory = result.watchHistory || [];
  const historyContainer = document.getElementById("history-container");
  const formattedTime = formatTime(minutesWatched);
  if (watchHistory.length === 0) {
    historyContainer.innerHTML = "No watch history available.";
  } else {
    watchHistory.forEach((entry) => {
      const historyElement = document.createElement("div");
      historyElement.textContent = `${entry.date}: ${formattedTime}`;
      historyContainer.appendChild(historyElement);
    });
  }
});
