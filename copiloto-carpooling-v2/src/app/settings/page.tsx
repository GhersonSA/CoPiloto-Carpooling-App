const Settings = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
            <h2 className="text-4xl font-bold text-blue-950 mb-2">
                Sección que está en desarrollo
            </h2>
            <p className="text-xl text-gray-600 mb-4">
                ¡Muy pronto podrás disfrutar de esta funcionalidad!
            </p>
            <span className="inline-flex items-center gap-2 text-lg text-gray-400">
                <i className="fa-solid fa-person-digging text-2xl text-blue-950"></i>
                Estamos trabajando en ello...
            </span>
        </div>
    );
}

export default Settings;