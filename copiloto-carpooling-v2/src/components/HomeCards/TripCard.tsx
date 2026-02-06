'use client';

import Image from "next/image";
import { TripCardProps } from "@/types/Trip";

const TripCard = ({ img, onClick, nombre }: TripCardProps) => {
    return (
        <div onClick={onClick} className="cursor-pointer">
            <div className="trip-cards">
                <div className="img-home-cards-container">
                    {img ? (
                        <Image src={img} alt={nombre} width={120} height={120} className="img-home-cards" />
                    ) : (
                        <Image src="https://www.enjoyzaragoza.es/wp-content/uploads/2021/04/Imagen-3.jpg" alt={nombre} width={120} height={120} className="img-home-cards" />
                    )}
                </div>
                <h2 className="text-4xl text-center text-blue-950 font-bold mb-2 mt-6">{nombre}</h2>
            </div>
        </div>
    );
}

export default TripCard;