import { Country, State } from "country-state-city"
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"

export const SelectLocation = () => {
    const [selectedCountry, setSelectedCountry] = useState("")
    const [allStates, setAllStates] = useState("")
    const [selectedState, setSelectedState] = useState("")

    const countries = Country.getAllCountries()

    useEffect(() => {
        const states = State.getStatesOfCountry(selectedCountry)

        // setAllStates(states!)
        console.log(selectedCountry)
    }, [selectedCountry])

    return (
        <div>
            <h3>Prayer Time Settings</h3>
            <Select onValueChange={value => setSelectedCountry(value)}>
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
        </div>
    )
}