import { Country, State } from "country-state-city"
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"
import type { IState } from 'country-state-city'
import { calculationMethods } from "./data/constants"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Label } from "./ui/label"
import { Switch } from "./ui/switch"
import { useForm } from "react-hook-form"
import { Button } from "./ui/button"
import { Key } from "lucide-react"




export const SelectLocation = () => {
    const [selectedCountry, setSelectedCountry] = useState("x")
    const [allCities, setAllCities] = useState<IState[]>([])
    const [selectedState, setSelectedState] = useState("")

    const { register, handleSubmit, watch, setValue, } = useForm({
        defaultValues: {
            country: "",
            city: "",
            calculationMethod: "Muslim World League",
            juristicMethod: 0,
            midnightMode: false,
            tune: {
                Fajr: 0,
                Duhr: 0,
                Asr: 0,
                Maghrib: 0,
                Isha: 0
            }
        }
    })

    const countries = Country.getAllCountries()
    const prayers = { Fajr: watch("tune.Fajr"), Duhr: watch("tune.Duhr"), Asr: watch("tune.Asr"), Maghrib: watch("tune.Maghrib"), Isha: watch("tune.Isha") }

    useEffect(() => {
        const states = State.getStatesOfCountry(selectedCountry)

        setAllCities(states)
        console.log(selectedCountry)
    }, [selectedCountry])

    //watch (all inputs)
    const country = watch("country")
    const city = watch("city")
    const calculationMethod = watch("calculationMethod")
    const juristicMethod = watch("juristicMethod")
    const midnightMode = watch("midnightMode")



    const savePrayerSettings = (data){

    }
    return (
        <div>
            <h3>Prayer Time Settings</h3>
            <form onSubmit={handleSubmit(savePrayerSettings)}>
            //country
                <Select onValueChange={value => setSelectedCountry(value)} required>
                    <SelectTrigger className="w-[280px]">
                        <SelectValue placeholder="Select Your Country" />
                    </SelectTrigger>
                    <SelectContent className="h-[300px]">
                        {countries.map((country) => (
                            <SelectItem key={country.isoCode} value={country.isoCode}>{country.name}</SelectItem>
                        )
                        )}
                    </SelectContent>
                </Select>

            //city
                <Select disabled={!selectedCountry && !allCities}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Your City" />
                    </SelectTrigger>
                    <SelectContent >
                        {allCities.length === 0 ?
                            <SelectItem value={selectedCountry}> {selectedCountry} </SelectItem>
                            : allCities.map(city => <SelectItem key={city.isoCode} value={city.name}>
                                {city.name}
                            </SelectItem>)}
                    </SelectContent>
                </Select>

            //prayer calculation method
                <Select defaultValue={"Muslim World League"}>
                    <SelectTrigger>
                        <SelectValue placeholder="Muslim World League" />
                    </SelectTrigger>
                    <SelectContent>
                        {calculationMethods.map((method, index) => <SelectItem key={index} value={index.toString()}> {method}</SelectItem>)}
                    </SelectContent>
                </Select>

                <RadioGroup className="flex gap-2">
                    <RadioGroupItem value="0" id="0" />
                    <Label htmlFor="0">Shafi</Label>
                    <RadioGroupItem value="1" id="1" />
                    <Label htmlFor="1">Hanafi (Later Asr)</Label>
                </RadioGroup>

            //midnightMode switch - add tooltip
                <Switch id="midnightMode" />
                <Label htmlFor="midnightMode">Midnight Mode</Label>

            //tune - adjust prayer time
                {/* To Do: Add tooltip*/}
                <div className="flex gap-2">
                    {Object.entries(prayers).map(([key, value]) => (
                        <div key={key}>
                            <div className="flex gap-1">
                                <Button type="button" onClick={() => setValue(`tune.${key}`, value - 1)}> - </Button>

                            </div>

                        </div>
                    ))}
                </div>
                {/* To Do: Add reminder Type */}
                <Button type="submit">Save</Button>
            </form >
        </div >
    )
}

