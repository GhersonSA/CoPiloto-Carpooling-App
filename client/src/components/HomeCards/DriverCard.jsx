const DriverCard = ({ img, onClick, nombre, marca, plazas, origen, destino, horaSalida, horaRegreso }) => {
    return (
        <div onClick={onClick} className="cursor-pointer">
            <div className="home-cards">
                <div className="img-driver-cards-container">
                    <img src={img} alt={nombre} className="img-home-cards"/>
                </div>
                <h2 className="text-4xl text-blue-950 font-bold mb-2 mt-6">{nombre}</h2>
                <p className="text-xl text-gray-700 mt-2"><strong>Vehículo:</strong> {marca}</p>
                <p className="text-xl text-gray-700"><strong>Plazas disponibles:</strong> {plazas}</p>
                <p className="text-xl text-gray-700"><strong>Ruta:</strong> {origen} - {destino}</p>
                <p className="mt-3 text-xl text-gray-600"><strong>Salida:</strong> {horaSalida} <strong>Regreso:</strong> {horaRegreso}</p>
            </div>
        </div>
    );
};

export default DriverCard;