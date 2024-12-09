import React, { useState, useEffect } from 'react';
import { useLoadScript, GoogleMap } from '@react-google-maps/api';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { cn } from '@/lib/utils';

interface LocationInputProps {
  value: string;
  onChange: (value: string, coordinates?: { lat: number; lng: number }) => void;
  className?: string;
  id?: string;
}

const libraries: ["places"] = ["places"];
const defaultCenter = { lat: 37.7749, lng: -122.4194 }; // San Francisco

export function LocationInput(props: LocationInputProps) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return <LocationInputLoaded {...props} />;
}

function LocationInputLoaded({ value, onChange, className, id = 'location' }: LocationInputProps) {
  const [coordinates, setCoordinates] = useState(defaultCenter);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const {
    ready,
    suggestions: { status, data },
    setValue: setPlacesValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {},
    debounce: 300,
    defaultValue: value,
  });

  // Update Places Autocomplete when form value changes
  useEffect(() => {
    setPlacesValue(value, false);
  }, [value, setPlacesValue]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setPlacesValue(newValue);
  };

  const handleSelect = async (description: string) => {
    setPlacesValue(description, false);
    clearSuggestions();
    onChange(description);

    try {
      const results = await getGeocode({ address: description });
      const coords = await getLatLng(results[0]);
      setCoordinates(coords);
      onChange(description, coords);
      
      if (map) {
        map.panTo(coords);
        map.setZoom(15);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="relative">
        <input
          type="text"
          id={id}
          value={value}
          onChange={handleInput}
          disabled={!ready}
          className={cn(
            "w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent",
            "border-gray-300"
          )}
          placeholder="Type to search..."
        />
        {status === 'OK' && (
          <ul className="absolute z-10 w-full bg-white mt-1 border rounded-md shadow-lg max-h-60 overflow-auto">
            {data.map(({ place_id, description }) => (
              <li
                key={place_id}
                onClick={() => handleSelect(description)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                {description}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="h-[200px] rounded-md overflow-hidden">
        <GoogleMap
          zoom={13}
          center={coordinates}
          mapContainerClassName="w-full h-full"
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
          onLoad={setMap}
        />
      </div>
    </div>
  );
} 