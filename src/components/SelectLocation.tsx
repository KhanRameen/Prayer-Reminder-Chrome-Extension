import { Country, State } from "country-state-city"
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"
import type { IState } from 'country-state-city'
import { calculationMethods } from "./data/constants"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Label } from "./ui/label"
import { Switch } from "./ui/switch"
import { Controller, useForm } from "react-hook-form"
import { Button } from "./ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import type { PrayerSettingsForm } from "./types/types"


export const SelectLocation = () => {

    const [allCities, setAllCities] = useState<IState[]>([])

    const { control, handleSubmit, watch, setValue } = useForm<PrayerSettingsForm>({
        defaultValues: {
            Country: "",
            City: "",
            CalculationMethod: "Muslim World League",
            JuristicMethod: "0",
            MidnightMode: false,
            Tune: {
                Fajr: 0,
                Duhr: 0,
                Asr: 0,
                Maghrib: 0,
                Isha: 0
            }
        }
    })

    const countries = Country.getAllCountries()



    //watch (all inputs)
    const country = watch("Country")
    // const city = watch("City")
    // const calculationMethod = watch("CalculationMethod")
    // const juristicMethod = watch("JuristicMethod")
    // const midnightMode = watch("MidnightMode")
    const tune = watch("Tune")

    useEffect(() => {
        let states = State.getStatesOfCountry(country)
        if (!states) {
            states = []
        }
        setAllCities(states!)
    }, [country])

    const savePrayerSettings = (data: PrayerSettingsForm) => {
        console.log(data)
        chrome.runtime.sendMessage(
            { type: "prayerSettings", data },
            (response) => { console.log("Background Acknowledged", response) }
        )
    }

    return (
        <div className="w-full flex flex-col gap-y-4">
            <h2>Prayer Time Settings</h2>

            <form onSubmit={handleSubmit(savePrayerSettings)} className="space-y-4">

                <Label>Country</Label>
                <Controller
                    name="Country"
                    control={control}
                    render={({ field }) => (

                        <Select onValueChange={field.onChange} value={field.value} required>
                            <SelectTrigger className="w-[280px]">
                                <SelectValue placeholder="Select Your Country" />
                            </SelectTrigger>
                            <SelectContent className="h-[300px] ">
                                {countries.filter(Boolean).map((country) => (country &&
                                    <SelectItem key={country.isoCode} value={country.isoCode}>{country!.name}</SelectItem>
                                )
                                )}
                            </SelectContent>
                        </Select>
                    )} />


                <Label>City</Label>
                <Controller
                    name="City"
                    control={control}
                    render={({ field }) => (

                        <Select disabled={!country} onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Your City" />
                            </SelectTrigger>
                            <SelectContent >
                                {
                                    (allCities.length === 0 && country) ?
                                        <SelectItem value={country!}>{country!}</SelectItem>
                                        : allCities.filter(Boolean).map(city =>
                                            <SelectItem key={city!.isoCode} value={city!.name}>
                                                {city!.name}
                                            </SelectItem>
                                        )
                                }
                            </SelectContent>
                        </Select>

                    )}
                />


                <Label>Calculation Method</Label>
                <Controller
                    name="CalculationMethod"
                    control={control}
                    render={({ field }) => (

                        <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a Calculation Method" />
                            </SelectTrigger>
                            <SelectContent>
                                {calculationMethods.map((method, index) => <SelectItem key={index} value={method}> {method}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )} />


                <Label>Juristic Method / School</Label>
                <Controller
                    name="JuristicMethod"
                    control={control}
                    render={({ field }) => (
                        <RadioGroup className="flex gap-2" value={field.value} onValueChange={field.onChange}>
                            <RadioGroupItem value="0" id="0" />
                            <Label htmlFor="0">Shafi</Label>
                            <RadioGroupItem value="1" id="1" />
                            <Label htmlFor="1">Hanafi (Later Asr)</Label>
                        </RadioGroup>
                    )} />


                <Controller
                    name="MidnightMode"
                    control={control}
                    defaultValue={false}
                    render={({ field }) => (
                        <div className="flex items-center gap-3">
                            <Label htmlFor="midnightMode">Midnight Mode</Label>
                            <Switch
                                id="midnightMode"
                                checked={field.value}
                                onCheckedChange={field.onChange} />
                        </div>
                    )} />



                {/* To Do: Add tooltip*/}
                <Label> Adjust prayer time</Label>


                <div className="flex gap-2">
                    {Object.keys(tune).map(prayer => (
                        <Controller
                            key={prayer}
                            name={`Tune.${prayer}`}
                            control={control}
                            render={({ field }) => (

                                <div className="m-1 bg-amber-50/10">
                                    <strong> {prayer} </strong>
                                    <div className="flex">

                                        <input type="number" max={30} min={-15} {...field} className="border text-center" />

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
                <Button type="submit">Save</Button>
            </form >
        </div >
    )
}

//todo: add tool tip
// {/* To Do: Add reminder Type */}