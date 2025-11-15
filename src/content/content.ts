// meant for interacting with the webpage, like:
// reading DOM elements, modifying page content, injecting HTML/CSS, listening to clicks on the page,  scraping data from the site, communicating with background.js

//content.js sends data to background

//Runs inside the webpage. Can read info from the page or detect user activity. Sends data/messages to background.js.

//Our Usage: get all users settings on the popup and trigger get api

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log("Message received in content.js:", message, sender);
  if (message.action === "changeColor") {
    console.log("clicked");
    // message.tab.prevent.default();
    document.body.style.backgroundColor = "blue";
    const userLocalTime = new Date();

    chrome.runtime.sendMessage({
      type: "Test",
      time: userLocalTime.getTime(),
    });
    console.log("message sent");
  }
});
