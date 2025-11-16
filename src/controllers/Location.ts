import { count } from "console";
import { Country, State } from "country-state-city";

export const getAllCountries = () => {
  const CountriesList = Country.getAllCountries();
  console.log(CountriesList[1].name);
};
