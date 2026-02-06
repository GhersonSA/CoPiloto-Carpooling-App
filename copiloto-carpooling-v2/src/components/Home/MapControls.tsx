'use client';

import { useRouter } from 'next/navigation';

interface MapControlsProps {
    filter: 'todo' | 'chofer' | 'pasajero';
    onFilterChange: (filter: 'todo' | 'chofer' | 'pasajero') => void;
    isDisabled?: boolean;
}

const MapControls = ({ filter, onFilterChange, isDisabled = false }: MapControlsProps) => {
    const router = useRouter();

    return (
        <>
            {/* Botones de filtro superiores */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white rounded-full shadow-lg flex gap-2 p-2">
                <button
                    onClick={() => !isDisabled && onFilterChange('todo')}
                    disabled={isDisabled}
                    className={`px-3 py-2 rounded-full font-semibold transition flex items-center justify-center ${filter === 'todo'
                        ? 'bg-blue-950 text-white border-2 border-blue-950'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-blue-950'
                        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <i className="fa-solid fa-map-pin"></i>
                    &nbsp;Todo
                </button>
                <button
                    onClick={() => !isDisabled && onFilterChange('chofer')}
                    disabled={isDisabled}
                    className={`px-3 py-2 rounded-full font-semibold transition flex items-center justify-center ${filter === 'chofer'
                        ? 'bg-blue-700 text-white border-2 border-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-blue-950'
                        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <i className="fa-solid fa-car"></i>
                    &nbsp;Choferes
                </button>
                <button
                    onClick={() => !isDisabled && onFilterChange('pasajero')}
                    disabled={isDisabled}
                    className={`px-3 py-2 rounded-full font-semibold transition flex items-center justify-center ${filter === 'pasajero'
                        ? 'bg-green-600 text-white border-2 border-green-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-blue-950'
                        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <i className="fa-solid fa-person-walking"></i>
                    &nbsp;Pasajeros
                </button>
            </div>

            {/* Botón flotante de Viajes (solo mobile) */}
            <button
                onClick={() => router.push('/travel')}
                className="absolute bottom-20 right-5 z-10 md:hidden bg-white border-2 border-blue-950 text-blue-950 w-20 h-20 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
                aria-label="Ir a Viajes"
            >
                <span className="text-2xl">
                    <i className="fa-solid fa-map-location-dot"></i>
                </span>
            </button>
        </>
    );
};

export default MapControls;