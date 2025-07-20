import { useRoleData } from "../../hooks/useRoleData";

const Travel = () => {

    const { passengers } = useRoleData();

    const activePassenger = passengers.filter(p => p.activo);

    return (
        <section className="section-container">
            <h2 className="section-h2">Viajes activos</h2>
            <div className="m-5 flex flex-col gap-5">
                {activePassenger.map((passenger) => (
                    <div key={passenger.id} className="flex items-center bg-white p-5 md:p-10 rounded-lg hover:scale-101 transition-transform duration-300 shadow-lg">
                        <div className="w-40">
                            <img src={passenger.img} alt="passenger" className="w-30 h-30 object-cover rounded-full" />
                            <h3 className="mt-4 md:text-xl">Hora de salida:</h3>
                            <h3 className="font-bold text-lg md:text-2xl">13:10 - 13:15</h3>
                        </div>
                        <div className="pl-5 md:ml-0">
                            <h2 className="text-2xl font-bold text-blue-950">{passenger.nombre}</h2>
                            <h3 className="text-xl font-bold mt-3">{passenger.direccion} <span><i className="fa-solid fa-arrow-right"></i></span> {passenger.trabajo} </h3>
                            <button className="bg-blue-950 text-white font-bold w-30 md:text-xl mt-3 p-4 rounded-3xl cursor-pointer">
                                Detalles
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default Travel;