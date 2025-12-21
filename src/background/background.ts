import type { PrayerSettingsForm } from "@/components/types/types";

chrome.runtime.onInstalled.addListener(() => {
  // chrome.storage.local.clear()
  // chrome.alarms.clearAll();
  scheduleNextMidnight();
});

chrome.runtime.onStartup.addListener(() => {
  ensurePrayerData();
});

//eventListener
chrome.runtime.onMessage.addListener(async (message, sender, sendResonse) => {
  //getUserSettings (data from Popup)
  if (message.type === "prayerSettingsStored") {
    //call API
    await getPrayerData();

    //todo: send response

    return true;
  }
});

//alarmListener
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "midnightUpdate") {
    await getPrayerData();
    scheduleNextMidnight();
  }
});

//Controllers
const getPrayerData = async () => {
  console.log("getting prayer time");

  //get data from local storage
  chrome.storage.local.get(["prayerSettings"], async ({ prayerSettings }) => {
    const formData = prayerSettings;

    try{
    
      if (!formData) {
        throw new Error("No Prayer Settings Data found");
      }

      const today = new Date();
      const tomorrow = new Date(today);
      const yesterday = new Date(today);

      tomorrow.setDate(today.getDate() + 1);
      yesterday.setDate(today.getDate() - 1);

      const dateToday=formatDate(today)
      const dateTomorrow=formatDate(tomorrow)
      const dateYesterday=formatDate(yesterday)
      

      const [y,t,tm]=await Promise.all([
        fetchPrayerAPI(formData,dateYesterday),
        fetchPrayerAPI(formData,dateToday),
        fetchPrayerAPI(formData,dateTomorrow)
      ])

      if(!y && !t && !tm){
        throw new Error("Failed to fetch Api Data")
      }

      const prayerData={
        yesterdayIsha:y.timings.Isha,
        today:t,
        tomorrowsFajr:tm.timings.Fajr
      }

      await chrome.storage.local.set({
        apiResult: prayerData,
      });
    }
    catch(err){
       console.log("error getting prayer data", err);
    await chrome.storage.local.set({ apiError: err.message });
    }
  
  });
};

const fetchPrayerAPI = async (formData:PrayerSettingsForm, date:string) => {
  try {
    const res = await fetch(
      `https://api.aladhan.com/v1/timingsByCity/${date}?city=${formData.City}&country=${formData.Country.isoCode}&method=${formData.CalculationMethod}&shafaq=general&tune=5%2C${formData.Tune.Fajr}%2C5%2C${formData.Tune.Duhr}%2C${formData.Tune.Asr}%2C${formData.Tune.Maghrib}%2C0%2C${formData.Tune.Isha}%2C-6&school=${formData.JuristicMethod}&midnightMode=${formData.MidnightMode}timezonestring=UTC&calendarMethod=UAQ`
    );

    if (!res.ok) {
      throw new Error(`API Failed. Date: ${date}, Status: ${res.status}`);
    }

    const response = await res.json();

    if (!response.data) {
      throw new Error("Fetching API data failed");
    }

    return response.data
  } catch (err) {
    console.log("error fetching prayer time", err);
    await chrome.storage.local.set({ apiError: err.message });
  }
};

const ensurePrayerData = async () => {
  const { prayerData } = await chrome.storage.local.get("apiResult");
  console.log("EnsurePrayer Data")
  const today = formatDate();
  if (!prayerData || prayerData.today.date.gregorian.date != today) {
    console.log("EnsurePrayer Data Failed")
    await getPrayerData();
    scheduleNextMidnight();
  }
};

const formatDate = (date = new Date()) => {
  const day = date
    .getDay()
    .toString()
    .padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

const scheduleNextMidnight = () => {
  const now = new Date();
  const next = new Date();

  next.setHours(24, 0, 0, 0);

  const minutesTillMidnight = (next - now) / 1000 / 60;

  chrome.alarms.create("midnightUpdate", {
    when: Date.now() + minutesTillMidnight * 60 * 1000,
  });
};

const getUserTime = (date = new Date()) => {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};
