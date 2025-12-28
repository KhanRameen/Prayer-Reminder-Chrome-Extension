import type { PrayerSettingsForm } from "@/components/types/types";

chrome.runtime.onInstalled.addListener(async() => {
  chrome.storage.local.clear()
  chrome.alarms.clearAll();
  await ensurePrayerData();
 });

chrome.runtime.onStartup.addListener(async() => {
  await ensurePrayerData();
});

//eventListener
chrome.runtime.onMessage.addListener(async (message, sender, sendResonse) => {
  //getUserSettings (data from Popup)
  if (message.type === "prayerSettingsStored") {
    //call API
    await getPrayerData();
    await schedulePrayerAlarms();
    scheduleNextMidnight();
    sendResonse({response:"Success"})  
  }
  return true;
});

//alarmListener
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "midnightUpdate") {
    await getPrayerData();
    await schedulePrayerAlarms();
    scheduleNextMidnight();
  }

  if(alarm.name.startsWith("prayer-")){
    console.log("Listening Alarm for Prayer")
    const [,name,nextAlarmTime]=alarm.name.split("-").map(String)
    showPrayerNotification(name,nextAlarmTime)
  }

  if(alarm.name.startsWith("snooze-")){
    console.log("Listenig to Snooze Alarm")
    const [,name,nextPrayerTime]=alarm.name.split("-").map(String)

    const allowSnooze=canSnooze(Number(nextPrayerTime))

    const options: chrome.notifications.NotificationCreateOptions= {
    type: "basic" as const ,
    iconUrl:"icons/masjid-icon.png",
    title:`${name} Prayer Reminder`,
    message:`You Snoozed ${name} prayer. Your success here and in the hereafter awaits`,
    priority:2
    }

    if(allowSnooze){
      options.buttons=[
        {title:"Snooze 15 min"}
      ]
    }

    chrome.notifications.create(alarm.name,options)
  }
  
});



//notificaitonListener
chrome.notifications.onButtonClicked.addListener(
  async(notificationId,buttonIndex)=>{
    if(buttonIndex!==0)return ;
    console.log("Listening to Notification button click")
    if(notificationId.startsWith("notify-") || notificationId.startsWith("snooze-")){
      const [,name,nextPrayerTime]=notificationId.split("-").map(String)
      const snoozeTime=Date.now()+15*50*1000

      chrome.alarms.create(`snooze-${name}-${nextPrayerTime}`,{when:snoozeTime})

      chrome.notifications.clear(notificationId)
    }

  }
)

//Controllers
const getPrayerData = async () => {
  console.log("getting prayer time");

  //get data from local storage
  await chrome.storage.local.get(["prayerSettings"], async ({ prayerSettings }) => {
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
      `https://api.aladhan.com/v1/timingsByCity/${date}?city=${formData.City}&country=${formData.Country.isoCode}&method=${formData.CalculationMethod}&shafaq=general&tune=5%2C${formData.Tune.Fajr}%2C${formData.Tune.Sunrise}%2C${formData.Tune.Dhuhr}%2C${formData.Tune.Asr}%2C${formData.Tune.Maghrib}%2C0%2C${formData.Tune.Isha}%2C-6&school=${formData.JuristicMethod}&midnightMode=${formData.MidnightMode}timezonestring=UTC&calendarMethod=UAQ`
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
  await chrome.storage.local.get("apiResult", async({apiResult})=>{
    console.log("EnsurePrayer Data")
    const today = formatDate(new Date());
    if (!apiResult && apiResult.today.date.gregorian.date != today) {
      console.log("EnsurePrayer Data Failed")
      await getPrayerData();
      await schedulePrayerAlarms()
      scheduleNextMidnight();
    }
    else{
      console.log("Todays prayer data and alarm exist")
    }
    
  });
 
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

const schedulePrayerAlarms= async()=>{
  await buildPrayerTimelineforAlarm()
  const now=Date.now()
  
  console.log("Scheduling Alarm")

  chrome.storage.local.get("prayerNotificationList", ({prayerNotificationList})=>{
    const prayerList:[]=prayerNotificationList

    prayerList.forEach(({name,time,nextPrayerTime})=>{
      const when = Number(time)

      if(when<=now) return;
      
      console.log("creating alarm")
      const alarmName=`prayer-${name}-${nextPrayerTime}`

      chrome.alarms.create(alarmName,{when})

      console.log("Alarm Created for each", alarmName)

    })
  })

  console.log("Outside Scheduling alarm")

}


const buildPrayerTimelineforAlarm= async()=>{
  console.log('Building Timeline')

  chrome.storage.local.get("apiResult",async({apiResult})=> {

    console.log("getting prayer data to build timeline")

    const skipList = ["Firstthird", "Sunrise", "Imsak", "Lastthird", "Midnight", "Sunset"]    
    const date=await apiResult.today.date.gregorian.date
    const prayersToday: {name:string,time:string}[] = []   
    const timings=await apiResult.today.timings

    Object.entries(timings).filter(([name, time]) => !skipList.includes(name)).forEach(([name, time]) => {
        console.log("Object Entries")
        const timestamp = buildTimestamps(date, String(time))
        prayersToday.push({ name, time:String(timestamp) })
        console.log("Prayers today push")
    }) //Array

    prayersToday.sort((a, b) => Number(a.time) - Number(b.time))

    console.log({prayersToday})
    console.log(prayersToday.length)

    const tomorrowsFajr=apiResult.tomorrowsFajr //time

    const prayerlist = [];  

    //create the list
    for (let i = 0; i < prayersToday.length; i++) {
        console.log("Looping")
        if (i === prayersToday.length - 1) {
            console.log("if Case")
            const { name, time } = prayersToday[i]
            // const prayerTime = buildTimestamps(date, time)
            const nextPrayerTime = String(buildTimestamps(date, tomorrowsFajr))
            prayerlist.push({
                name,
                time,
                nextPrayerTime
            })
            console.log("prayerlist push")
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
            console.log("prayerlist push")
        }
      }

      console.log({prayerlist})
      await chrome.storage.local.set({prayerNotificationList:prayerlist})           
      console.log("Timeline Saved in the local storage")
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

const canSnooze = (nextPrayerTime:number) =>{
  const now = Date.now()
  const difference= nextPrayerTime-now

  const differenceInMin=difference/(1000*60)

  return differenceInMin>20
}

const showPrayerNotification=(name:string,nextPrayerTime:string)=>{  
  const allowSnooze=canSnooze(Number(nextPrayerTime))

  const options: chrome.notifications.NotificationCreateOptions= {
    type: "basic" as const ,
    iconUrl:"icons/masjid-icon.png",
    title:`${name} Prayer Time`,
    message:`It is time to offer ${name} prayer. Come to Prayer, Come to Success!`,
    priority:2
  }

  if(allowSnooze){
    options.buttons=[
      {title:"Snooze 10 min"}
    ]
  }

  chrome.notifications.create(
    `notify-${name}-${nextPrayerTime}`,
    options,
  )
  
}

