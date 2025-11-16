import { getAllCountries } from "../controllers/Location";

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extention Installed!");
});

getAllCountries();

//API Calls
// chrome.alarms.create("getPrayerTime", { periodInMinutes: 0.1 });

// chrome.alarms.onAlarm.addListener(async (alarm) => {
//   if (alarm.name === "getPrayerTime") {
//     console.log("alarm created");
//     await getPrayerTime();
//   }
// });

const getPrayerTime = async () => {
  try {
    console.log("getting prayer time");
    console.log("Date", Date.now().toString());

    const res = await fetch(
      "https://api.aladhan.com/v1/timingsByCity/15-11-2025?city=Karachi&country=PK&state=Karachi&method=3&shafaq=general&tune=5%2C3%2C5%2C7%2C9%2C-1%2C0%2C8%2C-6&school=1&timezonestring=UTC&calendarMethod=UAQ"
    );

    const data = await res.json();

    // await chrome.storage.local.set({ prayerTime: data });
    console.log("Latest Prayer Data", data.data);

    chrome.storage.local.clear();
  } catch (err) {
    console.log("error fetching prayer time", err);
  }
};

//Controllers
