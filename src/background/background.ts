import type { PrayerSettingsForm } from "@/components/types/types";

chrome.runtime.onInstalled.addListener(() => {
  // chrome.storage.local.clear()
  // chrome.alarms.clearAll();
  ensurePrayerData();
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
        

      console.log("Inside get Prayer Data",{dateToday, dateTomorrow, dateYesterday})

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

      console.log("New API Result",prayerData)
    }
    catch(err){
       console.log("error getting prayer data", err);
      await chrome.storage.local.set({ apiError: err.message });
    }
  
  });
};

const fetchPrayerAPI = async (formData:PrayerSettingsForm, date:string) => {
  try {
    console.log("Fetching Api")
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
  const today = formatDate(new Date());
  if (!prayerData || prayerData.today.date.gregorian.date != today) {
    console.log("EnsurePrayer Data Failed")
    await getPrayerData();
    scheduleNextMidnight();
  }
};

const formatDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2,"0")
  const month = String(date.getMonth()+1).padStart(2,"0")
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

// const schedulePrayerAlarms= ()=>{
//   buildPrayerTimelineforAlarm()
//   const now=Date.now()
  
//   chrome.storage.local.get("prayerNotificationList", ({prayerNotificationList})=>{
//     prayerNotificationList.forEach(({name,time,nextPrayerTime})=>{
//       if(time<=now) return;
//       const alarmName=`prayer-${name}-${when}`
//       chrome.alarms.create(alarmName,{when:time})

//     })
//   })

// }

const buildPrayerTimelineforAlarm=()=>{
  const prayerList= chrome.storage.local.get("apiresult", ({apiResult})=> {

    const skipList = ["Firstthird", "Sunrise", "Imsak", "Lastthird", "Midnight", "Sunset"]
    const date=apiResult.today.date.gregorian.date

    const prayersToday = [{name:"",time:number}]     
    Object.entries(apiResult.today.timings).filter(([name, time]) => !skipList.includes(name)).forEach(([name, time]) => {
        time = buildTimestamps(date, time)
        prayersToday.push({ name, time })
    }) //Array

    prayersToday.sort((a, b) => Number(a.time) - Number(b.time))


    const tomorrowsFajr=apiResult.tomorrowsFajr //time

    const prayerlist = [];

    //create the list
    for (let i = 0; i < prayersToday.length; i++) {
        console.log("Looping")
        if (i === prayersToday.length - 1) {
            console.log("if Case")
            const { name, time } = prayersToday[i]
            // const prayerTime = buildTimestamps(date, time)
            const nextPrayerTime = buildTimestamps(date, tomorrowsFajr)
            prayerlist.push({
                name,
                time,
                nextPrayerTime
            })
        }
        else {
            console.log("else case")
            const { name, time } = prayersToday[i]
            const { next, time: nextPrayerTime } = prayersToday[i + 1]
            prayerlist.push({
                name,
                time,
                nextPrayerTime
            })

        }
      }
      chrome.storage.local.set({prayerNotificationList:prayerList})           
  })
  
}

const buildTimestamps= (date:string,time:string):number=> {
   const [day, month, year] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);

  return new Date(
    year,
    month - 1,
    day,
    hours,
    minutes,
    0,
    0
  ).getTime();
}

