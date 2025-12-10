import type { PrayerSettingsForm } from "@/components/types/types";

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("refreshPrayerData", {
    periodInMinutes: 6 * 60,
  });
});

//API Calls
chrome.alarms.create("getPrayerTime", { periodInMinutes: 0.1 });

// chrome.alarms.onAlarm.addListener(async (alarm) => {
//   if (alarm.name === "getPrayerTime") {
//     console.log("alarm created");
//     await getPrayerTime();
//   }
// });

//Controllers
const getPrayerTime = async () => {
  try {
    console.log("getting prayer time");
    
    //get data from local storage
    chrome.storage.local.get(["prayerSettings"],({data})=>{
      
    })
    const date= formatedDate()

    const res = await fetch(
      `https://api.aladhan.com/v1/timingsByCity/${date}?city=${data.}&country=PK&state=Karachi&method=3&shafaq=general&tune=5%2C3%2C5%2C7%2C9%2C-1%2C0%2C8%2C-6&school=1&timezonestring=UTC&calendarMethod=UAQ`
    );

    const data = await res.json();

    // await chrome.storage.local.set({ prayerTime: data });
    console.log("Latest Prayer Data", data.data);

    chrome.storage.local.clear();
  } catch (err) {
    console.log("error fetching prayer time", err);
  }
};

const getUserTime = (date = new Date()) => {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const formatedDate = (date= new Date())=>{
    const day = date.getDay().toString().padStart(2,"0")
    const month = (date.getMonth()+1).toString().padStart(2,"0")
    const year= date.getFullYear();

    return `${day}-${month}-${year}`
}


const scheduleNextMidnight = () => {
  const now = new Date();
  const next = new Date();

  next.setHours(24, 0, 0, 0);

  const minutesTillMidnight = (next - now) / 1000 / 60;

  chrome.alarms.create("midnightUpdate"{
    when: Date.now() + minutesTillMidnight * 60 * 1000 
  });
};

//eventListener
chrome.runtime.onMessage.addListener(async(message, sender, sendResonse) => {
  //getUserSettings (data from Popup)
  if (message.type === "prayerSettings") {
    const data = JSON.stringify(message.data);

    await chrome.storage.local.set({prayerSettings:data})
    //store response in storage

    //call API
    
    //then store/set data in local storage
    
    //handle error
  }
});


//alarmListener
chrome.alarms.onAlarm.addListener(async(alarm)=>{
  if(alarm.name==="midnightUpdate"){
    //Todo:call api to update prayer data
    scheduleNextMidnight() 
  }
})



