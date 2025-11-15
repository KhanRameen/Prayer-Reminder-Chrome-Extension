chrome.runtime.onInstalled.addListener(() => {
  console.log("Extention Installed!");
});

//call Api
chrome.alarms.create("getPrayerTime", { periodInMinutes: 0.5 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "getPrayerTime") {
    console.log("alarm created");
    await getPrayerTime();
  }
});

const getPrayerTime = async () => {
  try {
    console.log("getting prayer time");
    console.log("Date", Date.now().toString());
    // const res = await fetch(
    //   `"https://api.aladhan.com/v1/timingsByCity/${"01-01-2025"}?city=${"Karachi"}&country=${"PK"}&state=${"Karachi"}&method=3&shafaq=general&tune=5%2C3%2C5%2C7%2C9%2C-1%2C0%2C8%2C-6&timezonestring=UTC&calendarMethod=UAQ`
    // );
    const res = await fetch(
      "https://api.aladhan.com/v1/timingsByCity/15-11-2025?city=Karachi&country=PK&state=Karachi&method=3&shafaq=general&tune=5%2C3%2C5%2C7%2C9%2C-1%2C0%2C8%2C-6&school=1&timezonestring=UTC&calendarMethod=UAQ"
    );
    const data = res.json();

    await chrome.storage.local.set({ prayerTime: data });
    console.log("Latest Prayer Data", data);

    // chrome.storage.local.get("prayerTime", (res) => {
    //   console.log("Latest Prayer Data", res.prayerTime);
    // });
  } catch (err) {
    console.log("error fetching prayer time", err);
  }
};

// chrome.runtime.onMessage.addListener((msg) => {
//   if (msg.type === "Test") {
//     console.log("Clicked Message Background");
//     chrome.alarms.create("test", { when: msg.time + 60000 });
//     console.log("alarm created");
//   }
// });

// chrome.alarms.onAlarm.addListener((alarm) => {
//   if (alarm.name === "test") {
//     console.log("alarm active");
//     chrome.notifications.create({
//       type: "basic",
//       iconUrl: "./icons/pirate-parrot.png",
//       title: "Test Notification",
//       message: alarm.name,
//     });
//     console.log("notified");
//   }
// });
