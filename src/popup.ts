document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("changecolor");

  button?.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab?.id) {
      console.warn("Tab data missing");
      return;
    }

    if (tab!.url!.startsWith("chrome://")) {
      console.warn("Cannot modify internal Chrome pages");
      return;
    } else {
      chrome.tabs.sendMessage(tab.id, { action: "changeColor" });
    }
  });
});
