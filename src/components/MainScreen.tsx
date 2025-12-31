import { EllipsisVertical } from "lucide-react"
import { AsrIcon, DhuhrIcon, FajrIcon, IshaIcon, LocationIcon, MaghribIcon, SunriseIcon } from "./ui/Icons"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Settings } from "./Settings"
import { LoadingScreen } from "./LoadingScreen"
import type { PrayerSettingsForm } from "./types/types"

const AllPrayersDisplay = [
    {
        timingKey: "Fajr",
        Icon: FajrIcon
    },
    {
        timingKey: "Sunrise",
        Icon: SunriseIcon

    },
    {
        timingKey: "Dhuhr",
        Icon: DhuhrIcon
    },
    {
        timingKey: "Asr",
        Icon: AsrIcon
    },
    {
        timingKey: "Maghrib",
        Icon: MaghribIcon
    },
    {
        timingKey: "Isha",
        Icon: IshaIcon
    },
]


const getPrayerTimeline = (data) => {
    const list = [];
    const skipList = ["Firstthird", "Imsak", "Lastthird", "Midnight", "Sunset"]

    function add(dayOffset, name, time) {
        const [h, m] = time.split(':').map(Number)
        const d = new Date();
        d.setDate(d.getDate() + dayOffset)
        d.setHours(h, m, 0, 0)
        list.push({ name, date: d })
        console.log("list push", { name, d })
    }

    if (data.yesterdayIsha) {
        add(-1, "Isha", data.yesterdayIsha)
        console.log("yesterday Isha")
    }

    Object.entries(data.today.timings).filter(([name, time]) => !skipList.includes(name)).forEach(([name, time]) => {
        add(0, name, time)
        console.log("todays ", name, time)
    })

    if (data.tomorrowsFajr) {
        add(1, "Fajr", data.tomorrowsFajr)
        console.log("tmrs Fajr")
    }

    return list.sort((a, b) => a.date - b.date)

}

const getCurrentAndNextPrayerTime = (timeline) => {
    console.log("Inside current Next, timeline param:", timeline)
    const now = new Date();
    console.log("NOW:", now)

    console.log("getting current and next prayers")

    let current = null
    let next = null

    for (let i = 0; i < timeline.length; i++) {
        if (timeline[i].date <= now) {
            current = timeline[i];
            next = timeline[i + 1] || null
        }
        console.log("looping")
    }

    //after midnight update
    if (!current) {
        current = timeline[0]
        next = timeline[1] || null
        console.log("midnights case")
    }


    return { current, next }

}


const getTimeLeft = (targetDate): string => {
    console.log("getting time left")
    const diff = targetDate - new Date()
    const totalMinutes = Math.ceil(diff / 60000)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60;


    if (hours > 0 && minutes > 0) {
        return `${hours} hour${hours > 1 ? "s" : ""} ${minutes} minute${minutes > 1 ? "s" : ""}`
    }

    if (hours > 0) {
        return `${hours} hour${hours > 1 ? "s" : ""}`
    }

    return `${minutes} minute${minutes > 1 ? "s" : ""}`

}

const getTimeFormated = (date: Date) => {
    return String(date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }));
};




export const MainScreen = ({ settings, setSettings }: { settings: PrayerSettingsForm, setSettings: (Settings: PrayerSettingsForm) => void }) => {
    const [screenState, setScreenState] = useState<"loading" | "ready">("loading")
    const [data, setData] = useState(null)
    const [currentPrayer, setCurrentPrayer] = useState<{ name: string, date: Date }>()
    const [nextPrayer, setNextPrayer] = useState<{ name: string, date: Date }>()
    const [timeLeft, setTimeLeft] = useState<string>()
    const [location, setLocation] = useState({ city: "", country: "" })

    useEffect(() => {
        console.log("main useEffect")

        chrome.storage.local.get(["apiResult"], ({ apiResult }) => {
            if (!apiResult) {
                setScreenState("loading")
            }

            setScreenState("ready")
            console.log("apiresult on frontend")
            setData(apiResult.today)
            console.log("here, the error of today")
            const timeline = getPrayerTimeline(apiResult)
            const { current, next } = getCurrentAndNextPrayerTime(timeline)
            console.log("got the timeline", { current, next })

            setCurrentPrayer(current)
            setNextPrayer(next)

            setTimeLeft(() => getTimeLeft(next?.date!))


        })

        chrome.storage.local.get("prayerSettings", ({ prayerSettings }) => {
            const country = prayerSettings.Country.name
            const city = prayerSettings.City

            setLocation({ city, country })
        })
    }, [settings])

    // const timeLeftText = getTimeLeft(nextPrayer?.date)
    // setTimeLeft(timeLeftText)



    return (
        <>
            {screenState === 'loading' ? <LoadingScreen /> :
                <div className="flex flex-col gap-y-3 p-0.5 text-[#3A3843]">
                    {data &&
                        <><div className="grid grid-cols-2 mb-14">
                            <div className="flex gap-x-1.5">
                                <LocationIcon />
                                <p className="font-numans">{location.city}, {location.country}</p>
                            </div>
                            <div className="flex justify-end">


                                <Dialog>
                                    <DialogTrigger>
                                        <EllipsisVertical className="stroke-1 size-5 bg-3A3843 hover:scale-110 transition-transform duration-200 cursor-pointer" />
                                    </DialogTrigger>
                                    <DialogContent className="bg-transparent">
                                        <DialogTitle className="hidden"></DialogTitle>
                                        <DialogDescription className="hidden"></DialogDescription>
                                        <Settings setSettings={setSettings} />
                                    </DialogContent>

                                </Dialog>




                            </div>
                        </div>

                            <div className="p-3 flex flex-col justify-center text-center">
                                <p
                                    className="font-numans">
                                    {data.date.hijri.month.en}, {data.date.hijri.day}, {data.date.hijri.year} {data.date.hijri.designation.abbreviated}
                                </p>
                                {currentPrayer &&
                                    <div className="relative flex flex-col items-center ">
                                        <span
                                            className="max-h-20 font-figtree text-[62px] text-white text-shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
                                            {getTimeFormated(currentPrayer?.date)}
                                        </span>
                                        <span
                                            className="font-prompt font-bold text-[32px] text-[#1D596D]">
                                            {currentPrayer?.name?.toUpperCase()}
                                        </span>
                                    </div>
                                }
                                <p dir="rtl" className="text-[16px] mb-4">حيَّ عَلَى الصَّلَاة, حَيَّ عَلَى الْفَلَاح</p>

                            </div>

                            <div className="p-3 justify-center text-center">
                                {nextPrayer &&
                                    <p
                                        className="font-numans text-sm">
                                        {timeLeft} left in {nextPrayer?.name}
                                    </p>
                                }
                                <div className="mt-8 grid grid-cols-6 gap-x-1 justify-around">
                                    {AllPrayersDisplay.map(({ timingKey, Icon }) => {
                                        const time = data?.timings?.[timingKey]
                                        // if (!time || !Icon) return null;

                                        return (
                                            <div key={timingKey} className="h-10 flex flex-col items-center">
                                                <div className="align-middle items-center h-5"><Icon /></div>
                                                <p className="font-prompt font-medium pt-1">{timingKey}</p>
                                                <p className="font-numans text-[13px]">{time}</p>
                                            </div>
                                        )
                                    })}

                                </div>


                            </div>

                        </>
                    }

                </div>}
        </>

    )
}


