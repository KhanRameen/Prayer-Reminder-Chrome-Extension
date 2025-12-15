import { Settings } from "lucide-react"
import { LocationIcon } from "./ui/locationIcon"

export const MainScreen = () => {
    return (
        <div className="flex flex-col gap-y-3 p-0.5 text-[#3A3843]">
            <div className="grid grid-cols-2 mb-20">
                <div className="flex gap-x-1.5">
                    <LocationIcon />
                    <p className="font-numans">Karachi, Pakistan</p>
                </div>
                <div className="flex justify-end"><Settings className="stroke-1 size-5 bg-3A3843 shadow-2xs hover:scale-105 transition-transform duration-200 cursor-pointer" /></div>
            </div>
            <div className="flex flex-col justify-center text-center gap-y-1">
                <p className="font-numans">Jumada Al Akhira, 15, 1446 AH</p>
                <h1 className="font-figtree text-[60px] text-white text-shadow-2xs">14:25</h1>
                <h2 className="font-prompt font-semibold text-[30px] text-[#1D596D]">DUHR</h2>
                <p className="font-numans text-md ">24 min left in Asr</p>
            </div>


        </div>
    )
}