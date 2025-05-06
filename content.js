console.log("🧠 content.js loaded");
chrome.runtime.sendMessage({ url: window.location.href });
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "pauseVideo") {
    console.log("⏸️ Received pauseVideo message");

    let attempts = 0;
    const maxAttempts = 10;

    const tryPause = setInterval(() => {
      const video = document.querySelector("video");

      if (video) {
        if (!video.paused) {
          video.pause();
          console.log("✅ Paused the video!");
        } else {
          console.log("ℹ️ Video already paused.");
        }
        clearInterval(tryPause);
      } else {
        console.log("❌ Video not found yet. Retrying...");
        attempts++;
        if (attempts >= maxAttempts) {
          console.log("❌ Failed to find video after retries.");
          clearInterval(tryPause);
        }
      }
    }, 300); // check every 300ms
  }
  if (message.action === "startVideo") {
    const video = document.querySelector("video");

    if (video) {
      if (video.paused) {
        video.play();
        console.log("✅ Play the video!");
      } else {
        console.log("ℹ️ Video already paused.");
      }
    }
  }
});
