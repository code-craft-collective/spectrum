import { useState, createContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import axios, { AxiosError } from 'axios';
import {
  Flight,
  DataSourceContextType,
  City,
  CityCodeName,
  AirlineCodeName,
  Airline,
} from '../types';

type TDataSourceProvider = {
  children: React.ReactNode;
};

const HEADERS = {
  'x-rapidapi-key': import.meta.env.VITE_X_RAPIDAPI_KEY as string,
  'x-rapidapi-host': import.meta.env.VITE_X_RAPIDAPI_HOST as string,
  'X-Access-Token': import.meta.env.VITE_TRAVELPAYOUTS_TOKEN_API as string,
};

const CHEAPEST_FLIGHT_ENDPOINT =
  'https://travelpayouts-travelpayouts-flight-data-v1.p.rapidapi.com/v1/prices/cheap';

const CITIES_ENDPOINT =
  'https://travelpayouts-travelpayouts-flight-data-v1.p.rapidapi.com/data/en-GB/cities.json';

const AIRLINES_ENDPOINT =
  'https://travelpayouts-travelpayouts-flight-data-v1.p.rapidapi.com/data/en-GB/airlines.json';

const DataSourceContext = createContext<DataSourceContextType>({
  flights: [],
  fetchCheapestFlight: async () => {},
  isLoading: false,
  error: null,
  cities: {},
  airlines: {},
  isDataLoaded: false,
});

function DataSourceProvider({ children }: TDataSourceProvider) {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [cities, setCities] = useState({});
  const [airlines, setAirlines] = useState({});
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AxiosError | null>(null);

  async function fetchCheapestFlight(params: { [key: string]: string }) {
    const options = {
      params: {
        calendar_type: 'departure_date',
        currency: 'EUR',
        page: '1',
        destination: params.destination || '-',
        origin: params.origin,
        return_date: params.return_date || '',
      },
      headers: HEADERS,
    };

    setIsLoading(true);

    try {
      const response = await axios.get(CHEAPEST_FLIGHT_ENDPOINT, options);

      const data = response.data.data;
      const formatedCheapestFlights = formatFlights(data);

      setFlights(formatedCheapestFlights);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(error);
      } else {
        console.log('error fetch', error);
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      const cachedCities = localStorage.getItem('cities');
      const cachedAirlines = localStorage.getItem('airlines');

      if (cachedCities && cachedAirlines) {
        setCities(JSON.parse(cachedCities));
        setAirlines(JSON.parse(cachedAirlines));
        setIsDataLoaded(true);
        return;
      }

      try {
        setIsDataLoaded(true);

        const [citiesResponse, airlineResponse] = await Promise.all([
          await axios.get(CITIES_ENDPOINT, { headers: HEADERS }),
          await axios.get(AIRLINES_ENDPOINT, { headers: HEADERS }),
        ]);

        const cityCodeName = citiesResponse.data.reduce(
          (acc: CityCodeName[], city: City) => {
            acc[city.code] = city.name_translations.en;
            return acc;
          },
          {}
        );

        const airlineCodeName = airlineResponse.data.reduce(
          (acc: AirlineCodeName[], airline: Airline) => {
            acc[airline.code] = airline.name_translations.en;
            return acc;
          },
          {}
        );

        localStorage.setItem('cities', JSON.stringify(cityCodeName));
        localStorage.setItem('airlines', JSON.stringify(airlineCodeName));

        setCities(cityCodeName);
        setAirlines(airlineCodeName);
        setIsDataLoaded(false);
      } catch (error) {
        console.log('error fetching data', error);
      } finally {
        setIsDataLoaded(false);
      }
    };

    fetchData();
  }, []);

  const translateAirline = (airlineCode: string) => {
    return airlines[airlineCode] || 'N.A';
  };

  const translateCity = (cityCode: string) => {
    return cities[cityCode] || 'N.A';
  };

  const formatFlights = (flights: CheapestFlight[]) => {
    if (!isDataLoaded) return [];
    return Object.keys(flights).flatMap((key) => {
      const city = translateCity(key);
      return Object.keys(flights[key]).map((flight_id) => {
        const flight = flights[key][flight_id];
        const airline = translateAirline(flight.airline);
        const _id = uuidv4();

        return { _id, city, flight_id, ...flight, airline };
      });
    });
  };

  const dataSourceValue = {
    flights,
    fetchCheapestFlight,
    isLoading,
    error,
    cities,
    airlines,
    isDataLoaded,
  };

  return (
    <DataSourceContext.Provider value={dataSourceValue}>
      {children}
    </DataSourceContext.Provider>
  );
}

export { DataSourceContext, DataSourceProvider };
