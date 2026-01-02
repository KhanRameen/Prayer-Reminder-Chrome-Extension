import { City, Country } from "country-state-city"
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"
import type { ICity } from 'country-state-city'
import { calculationMethods } from "./data/constants"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Label } from "./ui/label"
import { Switch } from "./ui/switch"
import { Controller, useForm } from "react-hook-form"
import { Button } from "./ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import type { PrayerSettingsForm } from "./types/types"
import { ScrollArea } from "./ui/scroll-area"
import { InfoIcon } from "./ui/Icons"
import { TooltipContent, TooltipTrigger, Tooltip, TooltipProvider } from "./ui/tooltip"




export const Settings = ({ setSettings }: { setSettings: (Settings: PrayerSettingsForm) => void }) => {

    const [allCities, setAllCities] = useState<ICity[]>([])

    const { control, handleSubmit, watch, setValue, setError, clearErrors, formState: { isSubmitting, errors, isValid } } = useForm<PrayerSettingsForm>({
        mode: "onChange",
        defaultValues: {
            Country: {
                isoCode: "",
                name: ""
            },
            City: "",
            CalculationMethod: "3",
            JuristicMethod: "0",
            MidnightMode: "0",
            Tune: {
                Fajr: 0,
                Sunrise: 0,
                Dhuhr: 0,
                Asr: 0,
                Maghrib: 0,
                Isha: 0
            }
        }
    })

    const countries = Country.getAllCountries()

    const country = watch("Country")
    const tune = watch("Tune")

    useEffect(() => {
        console.log("inside settings useEffect")
        let cities = City.getCitiesOfCountry(country.isoCode)
        if (!cities) {
            cities = []

        }
        setAllCities(cities!)
    }, [country?.isoCode])



    const savePrayerSettings = async (data: PrayerSettingsForm) => {
        console.log(data)
        await chrome.storage.local.set({ prayerSettings: data })
        chrome.runtime.sendMessage(
            { type: "prayerSettingsStored" }
        )
        setSettings(data)
    }

    return (
        <ScrollArea className="h-115 rounded-md w-full">
            <div className="w-full flex flex-col gap-y-4 p-1">
                <form onSubmit={handleSubmit(savePrayerSettings)} className="space-y-4">
                    {/* <h1 className="font-medium text-lg">Notification Settings</h1>

                    <Controller
                        name="MidnightMode"
                        control={control}
                        defaultValue={"0"}
                        render={({ field }) => (
                            <div className="flex items-center gap-3">

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger className="flex gap-1 cursor-pointer">                                            <InfoIcon />
                                            <Label htmlFor="midnightMode">Midnight Mode</Label>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Determines Jafri method for Calculating Midnight (Mid Sunset to Fajr)</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                <Switch
                                    id="midnightMode"
                                    checked={field.value === "1"}
                                    onCheckedChange={(checked) => {
                                        field.onChange(checked ? "1" : "0");  // turn boolean back into string
                                    }} />
                            </div>


                        )} />
 */}


                    <h1 className="font-medium text-lg">Prayer Time Settings</h1>

                    <Label className="mb-2">Country</Label>
                    <Controller
                        name="Country"
                        control={control}
                        rules={{
                            validate: (value) => (value && value.isoCode !== "") ? true : "Country is required"
                        }}

                        render={({ field }) => (
                            <>
                                <Select
                                    onValueChange={(isoCode) => {
                                        console.log("on value change country")
                                        const selected = countries.find((c) => c?.isoCode === isoCode)
                                        field.onChange({ isoCode, name: selected?.name ?? "" })
                                        clearErrors("Country")
                                    }}
                                    value={field.value?.isoCode} required>
                                    <SelectTrigger className="w-[320] mt-2">
                                        <SelectValue> {field.value?.name ?? "Select Your Country"}</SelectValue>
                                    </SelectTrigger>
                                    <SelectContent className="h-80">
                                        {countries.filter(Boolean).map((country) => (country &&
                                            <SelectItem
                                                key={country.isoCode}
                                                value={country.isoCode}>{country!.name}
                                            </SelectItem>
                                        )
                                        )}
                                    </SelectContent>
                                </Select>

                                {
                                    errors.Country && <p className="text-red-600 text-xs">{errors.Country.message}</p>
                                }
                            </>

                        )} />


                    <Label className="mb-2">City</Label>
                    <Controller
                        name="City"
                        control={control}
                        rules={{ validate: (value) => value !== "" ? true : "City is required" }}
                        render={({ field }) => (
                            <>
                                <Select disabled={!country.isoCode} onValueChange={field.onChange} value={field.value} required>
                                    <SelectTrigger className="w-[320] mt-2">
                                        <SelectValue placeholder="Select Your City" />
                                    </SelectTrigger>
                                    <SelectContent className="h-80">
                                        {
                                            (allCities.length === 0 && country.isoCode) ?
                                                <SelectItem value={country!.isoCode}>{country!.name}</SelectItem>
                                                : allCities.filter(Boolean).map(city =>
                                                    <SelectItem key={city!.stateCode} value={city!.name}>
                                                        {city!.name}
                                                    </SelectItem>
                                                )
                                        }
                                    </SelectContent>
                                </Select>

                                {
                                    errors.Country && <p className="text-red-600 text-xs">{errors.Country.message}</p>
                                }
                            </>

                        )}
                    />


                    <Label>Calculation Method</Label>
                    <Controller
                        name="CalculationMethod"
                        control={control}
                        defaultValue="3"
                        render={({ field }) => (

                            <Select value={field.value} onValueChange={val => field.onChange(val)} required>
                                <SelectTrigger className="w-[320] mt-2">
                                    <SelectValue placeholder="Select a Calculation Method" />
                                </SelectTrigger>
                                <SelectContent className="h-60 w-[320]">
                                    {calculationMethods.map((method, index) => <SelectItem key={index} value={index.toString()}> {method}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        )} />


                    <Label>Juristic Method / School</Label>
                    <Controller
                        name="JuristicMethod"
                        control={control}
                        render={({ field }) => (
                            <RadioGroup className="flex gap-3 mt-3 mb-5" value={field.value} onValueChange={field.onChange}>
                                <RadioGroupItem value="0" id="0" className="" />
                                <Label htmlFor="0">Shafi</Label>
                                <RadioGroupItem value="1" id="1" />
                                <Label htmlFor="1">Hanafi (Later Asr)</Label>
                            </RadioGroup>
                        )} />


                    <Controller
                        name="MidnightMode"
                        control={control}
                        defaultValue={"0"}
                        render={({ field }) => (
                            <div className="flex items-center gap-3">

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger className="flex gap-1 cursor-pointer mt-1">                                            <InfoIcon />
                                            <Label htmlFor="midnightMode">Midnight Mode</Label>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Determines Jafri method for Calculating Midnight (Mid Sunset to Fajr)</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                <Switch
                                    id="midnightMode"
                                    checked={field.value === "1"}
                                    onCheckedChange={(checked) => {
                                        field.onChange(checked ? "1" : "0");  // turn boolean back into string
                                    }} />
                            </div>


                        )} />



                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger className="flex gap-1 cursor-pointer mt-1">                <InfoIcon />
                                <Label> Adjust prayer time</Label>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[340] pl-3">
                                <p className="max-w-fit">Tune your prayer time in minutes. Adjusting time of one prayer does not affect time of other prayers</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <div className="gap-2 grid grid-cols-3">
                        {Object.keys(tune).map(prayer => (
                            <Controller
                                key={prayer}
                                name={`Tune.${prayer}`}
                                control={control}
                                render={({ field }) => (

                                    <div className="m-1">
                                        <strong> {prayer} </strong>
                                        <div className="flex">

                                            <input type="number" max={30} min={-15} {...field} className="border text-center w-15" />

                                            <div className="flex flex-col">

                                                <Button
                                                    size={"xs"}
                                                    type="button"
                                                    variant={"ghost"}
                                                    disabled={(field.value) >= 30 ? true : false}
                                                    onClick={() => { setValue(`Tune.${prayer}`, field.value + 1) }}>
                                                    <ChevronUp></ChevronUp>
                                                </Button>

                                                <Button
                                                    size={"xs"}
                                                    type="button"
                                                    variant={"ghost"}
                                                    disabled={(field.value) <= -15 ? true : false}
                                                    onClick={() => { setValue(`Tune.${prayer}`, field.value - 1) }}>
                                                    <ChevronDown></ChevronDown>
                                                </Button>

                                            </div>
                                        </div>
                                    </div>)} />

                        ))}
                    </div>
                    <Button type="submit" disabled={isSubmitting || !isValid} className="w-full cursor-pointer">{isSubmitting ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-white/90" /> : "Save"}</Button>
                </form >
            </div >
        </ScrollArea>
    )
}

//todo: add tool tip
// {/* To Do: Add reminder Type */}