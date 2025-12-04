import { Country, State } from "country-state-city"
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"
import type { IState } from 'country-state-city'
import { calculationMethods } from "./data/constants"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Label } from "./ui/label"
import { Switch } from "./ui/switch"




export const SelectLocation = () => {
    const [selectedCountry, setSelectedCountry] = useState("x")
    const [allCities, setAllCities] = useState<IState[]>([])
    const [selectedState, setSelectedState] = useState("")

    const countries = Country.getAllCountries()

    useEffect(() => {
        const states = State.getStatesOfCountry(selectedCountry)

        setAllCities(states)
        console.log(selectedCountry)
    }, [selectedCountry])

    return (
        <div>
            <h3>Prayer Time Settings</h3>

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

            {/* To Do: Add reminder Type */}
        </div>
    )
}

