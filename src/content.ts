chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "changeColor") {
    console.log("clicked");
    // message.tab.prevent.default();
    document.body.style.backgroundColor = "blue";
  }
});
