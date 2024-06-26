import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import InputField from './InputField';
import PassengerSelect from './PassengerSelect';
import DatePickerField from './DatePickerField';
import FlightTypeRadioGroup from './FlightTypeRadioGroup';
import SearchBarErrorMessage from './SearchBarErrorMessage';

import { FormInputs } from '../../../types';

import 'react-calendar/dist/Calendar.css';
import 'react-date-picker/dist/DatePicker.css';
import './SearchBar.css';

const labels = ['Return', 'One way', 'Multi City', 'Direct Flights'];

const schema = yup.object({
  destination: yup.string().required('Destination is required'),
  departureDate: yup.date().required('Departure date is required'),
  returnDate: yup.date().nullable(),
  passengers: yup.string().required('Passengers is required'),
  flightType: yup.string().required('Flight type is required'),
});

interface SearchBarProps {
  setDestinationInput: (value: string) => void;
  handleSearch: () => void;
}

function SearchBar({ setDestinationInput, handleSearch }: SearchBarProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: yupResolver(schema),
  });

  console.log('errors', errors);

  const onSubmit = (data: FormInputs) => {
    console.log('data', data);
    setDestinationInput(data.destination);
    handleSearch();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className=" h-60 my-10 py-3 px-20 border-2 rounded-lg bg-gray-300 backdrop-opacity-50"
    >
      <div className="flex flex-row justify-between items-center my-5">
        <InputField
          label="Departure"
          placeholder="From"
          name="departure"
          register={register}
          value="Berlin"
          readOnly
        />
        <InputField
          label="Destination"
          placeholder="Where to"
          name="destination"
          register={register}
        />
        <DatePickerField
          label="Departure Date"
          name="departureDate"
          control={control}
        />
        <DatePickerField
          label="Return Date"
          name="returnDate"
          control={control}
        />
        <PassengerSelect name="passengers" control={control} errors={errors} />
      </div>

      <div className="flex flex-row justify-between">
        <FlightTypeRadioGroup
          labels={labels}
          name="flightType"
          control={control}
        />
        <button
          type="submit"
          className="mt-6 px-4 py-2 bg-spectrum-primary text-black rounded-md"
        >
          Search Flights
        </button>
      </div>

      <SearchBarErrorMessage errors={errors} />
    </form>
  );
}

export default SearchBar;
