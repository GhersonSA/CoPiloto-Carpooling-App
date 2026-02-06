'use client';

import { StandaloneSearchBox } from '@react-google-maps/api';
import { useRef } from 'react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';

interface AddressAutocompleteProps {
    value: string;
    onChange: (address: string) => void;
    placeholder?: string;
}

const AddressAutocomplete = ({ value, onChange, placeholder = "Escribe una dirección..." }: AddressAutocompleteProps) => {
    const { isLoaded } = useGoogleMaps();

    const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const onPlacesChanged = () => {
        const places = searchBoxRef.current?.getPlaces();
        if (places && places.length > 0) {
            const address = places[0].formatted_address || '';
            onChange(address);
        }
    };

    if (!isLoaded) {
        return (
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="form-input"
                placeholder={placeholder}
            />
        );
    }

    return (
        <div className="relative w-full" style={{ zIndex: 99999 }}>
            <StandaloneSearchBox
                onLoad={(ref) => (searchBoxRef.current = ref)}
                onPlacesChanged={onPlacesChanged}
            >
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="form-input"
                    placeholder={placeholder}
                    autoComplete="off"
                />
            </StandaloneSearchBox>
        </div>
    );
};

export default AddressAutocomplete;