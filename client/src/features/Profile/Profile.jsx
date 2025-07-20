import profile from "../../assets/profile.png"

const Profile = () => {
    return (
        <section className="section-container">
            <h2 className="section-h2 sm:mb-0">Perfil</h2>
            <div className="flex flex-col sm:flex-row justify-center items-center m-5 gap-10 bg-white p-5 rounded-3xl shadow-lg">
                <div>
                    <img src={profile} alt="" className="w-100 h-100 object-cover rounded-full" />
                </div>
                <div>
                    <h2 className="text-5xl sm:text-7xl lg:text-8xl font-bold">Gherson Sánchez</h2>
                    <h3 className="text-3xl sm:text-5xl lg:text-6xl mt-5 text-gray-500">Chofer</h3>
                    <h4 className="text-2xl sm:text-4xl lg:text-5xl mt-2 text-yellow-500">Puntuación: Próximamente...</h4>
                </div>
            </div>
        </section>
    )
}

export default Profile;