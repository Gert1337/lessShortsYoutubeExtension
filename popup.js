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


