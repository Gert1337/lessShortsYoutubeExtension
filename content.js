console.log("🧠 content.js loaded");
chrome.runtime.sendMessage({ url: window.location.href });
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === "pauseAndConfirm") {
		console.log("⏸️ Received pauseAndConfirm message");

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

				setTimeout(() => {
					const userResponse = confirm(
						"You have been watching YouTube Shorts for 10 minutes. Do you want to do something else?"
					);
					if (!userResponse && video.paused) {
						video.play();
						console.log("▶️ User wants to keep watching. Video resumed.");
					} else {
						console.log("✅ User wants to take a break.");
					}
				}, 100); // Short delay before prompt
			} else {
				console.log("❌ Video not found yet. Retrying...");
				attempts++;
				if (attempts >= maxAttempts) {
					console.log("❌ Failed to find video after retries.");
					clearInterval(tryPause);
				}
			}
		}, 300);
	}
});