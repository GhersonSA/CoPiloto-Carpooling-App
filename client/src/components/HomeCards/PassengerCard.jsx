const PassengerCard = ({ img, onClick, nombre, direccion, trabajo }) => {
    return (
        <div onClick={onClick} className="cursor-pointer">
            <div className="home-cards">
                <div className="img-home-cards-container">
                    <img src={img} alt={nombre} className="img-home-cards"/>
                </div>
                <h2 className="text-4xl text-blue-950 font-bold mb-2 mt-6">{nombre}</h2>
                <p className="text-xl text-gray-700 mt-2"><strong>Dirección:</strong> {direccion}</p>
                <p className="mt-3 text-xl text-gray-600"><strong>Trabajo:</strong> {trabajo}</p>
            </div>
        </div>
    );
};

export default PassengerCard;