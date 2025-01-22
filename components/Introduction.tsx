import Image from "next/image";
import "animate.css";

const Introduction = () => {
  return (
    <section
      className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 bg-white"
      id="home"
    >
      <div className="max-w-7xl mx-auto w-full flex flex-col items-center">
        <Image
          width={842}
          height={485}
          src="/img/logo.png"
          alt="Logo BuscoCredito"
          className="lg:w-[40%] w-72 animate__animated animate__fadeInDown animate__delay-0.5s mb-16 object-contain"
          priority={true}
        />
        <h1 className="lg:text-5xl md:text-4xl text-3xl max-w-3xl text-center font-semibold text-gray-800 animate__animated animate__fadeIn animate__delay-1s leading-tight">
          Encuentra las diferentes opciones
          <span className="block mt-2">de préstamos que puedes tener</span>
        </h1>
        <p className="mt-6 text-xl text-gray-600 max-w-2xl text-center animate__animated animate__fadeIn animate__delay-1.5s">
          Conectamos prestamistas y prestatarios para un mejor futuro financiero
        </p>
      </div>
    </section>
  );
};

export default Introduction;
