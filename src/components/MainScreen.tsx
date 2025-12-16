import { Settings } from "lucide-react"
import { AsrIcon, DhuhrIcon, FajrIcon, IshaIcon, LocationIcon, MaghribIcon, SunriseIcon } from "./ui/Icons"
import { useEffect, useState } from "react"

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


const getCurrentAndNextPrayerTime = (prayerTimes) => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    const skipList = ["Firstthird", "Imsak", "Lastthird", "Midnight", "Sunset"]

    const unsortedlist = Object.entries(prayerTimes).filter(([name, time]) => !skipList.includes(name)).map(([name, time]) => {
        const [hour, minute]: [number, number] = time.split(":").map(Number)
        return {
            name, time, minute: hour * 60 + minute
        }
    })

    const list = [...unsortedlist].sort((prayerA, prayerB) => prayerA.minute - prayerB.minute)

    console.log(list)

    let currentPrayerName = ""
    let currentPrayerTime = ""
    let currentPrayerTimeInMinutes = 0
    let nextPrayerName = ""
    let nextPrayerTime = 0

    for (const prayer of list) {
        if (currentMinutes >= prayer.minute) {
            currentPrayerName = prayer.name
            currentPrayerTimeInMinutes = prayer.minute
            currentPrayerTime = prayer.time.toString()
            continue
        }
        if (currentPrayerTime && currentPrayerTimeInMinutes < prayer.minute) {
            nextPrayerName = prayer.name
            nextPrayerTime = prayer.minute - currentMinutes
            break
        }
    }

    return { currentPrayerName, currentPrayerTime, nextPrayerName, nextPrayerTime }
}


export const MainScreen = () => {
    const [data, setData] = useState(null)
    const [prayerTime, setPrayerTime] = useState({
        currentPrayerName: "", currentPrayerTime: undefined, nextPrayerName: "", nextPrayerTime: 0
    })

    useEffect(() => {
        chrome.storage.local.get(["apiResult"], (res) => {
            if (res.apiResult) {
                setData(res.apiResult)
                const { currentPrayerName, currentPrayerTime, nextPrayerName, nextPrayerTime } = getCurrentAndNextPrayerTime(res.apiResult.timings)
                setPrayerTime({
                    currentPrayerName, currentPrayerTime, nextPrayerName, nextPrayerTime
                })

            }
        })
    }, [])



    return (
        <div className="flex flex-col gap-y-3 p-0.5 text-[#3A3843]">
            {data && <>
                <div className="grid grid-cols-2 mb-20">
                    <div className="flex gap-x-1.5">
                        <LocationIcon />
                        <p className="font-numans">Karachi, Pakistan</p>
                    </div>
                    <div className="flex justify-end"><Settings className="stroke-1 size-5 bg-3A3843 shadow-2xs hover:scale-105 transition-transform duration-200 cursor-pointer" /></div>
                </div>

                <div className="flex flex-col justify-center text-center gap-y-0">
                    <p
                        className="font-numans">
                        {data.date.hijri.month.en}, {data.date.hijri.month.number}, {data.date.hijri.year} {data.date.hijri.designation.abbreviated}
                    </p>
                    <span
                        className="font-figtree text-[62px] text-white text-shadow-[0_4px_12px_rgba(0,0,0,0.2)] m-0">
                        {prayerTime.currentPrayerTime}
                    </span>
                    <span
                        className="font-prompt font-bold text-[32px] text-[#1D596D]">
                        {prayerTime.currentPrayerName.toUpperCase()}
                    </span>
                    <p
                        className="font-numans text-sm">
                        {prayerTime.nextPrayerTime} min left in {prayerTime.nextPrayerName}
                    </p>
                </div>

                <div className="p-5 mt-10 justify-center">
                    <div className="grid grid-cols-6 gap-x-1 justify-around">
                        {AllPrayersDisplay.map(({ timingKey, Icon }) => {
                            const time = data?.timings?.[timingKey]
                            if (!time || !Icon) return null;

                            return (
                                <div key={timingKey} className="flex flex-col items-center">
                                    <Icon />
                                    <p className="font-prompt font-medium py-1">{timingKey}</p>
                                    <p className="font-numans ">{time}</p>
                                </div>
                            )
                        })}

                    </div>

                </div></>
            }

        </div>
    )
}