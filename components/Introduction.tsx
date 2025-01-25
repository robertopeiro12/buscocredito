import Image from "next/image";
import "animate.css";

const Introduction = () => {
  return (
    <section
      className="flex flex-col items-center justify-center min-h-screen bg-white pb-20"
      id="home"
    >
      <div className="max-w-7xl mx-auto w-full flex flex-col items-center relative pt-20">
        {/* Logo section */}
        <div className="w-full flex justify-center mb-16">
          <Image
            width={842}
            height={485}
            src="/img/logo.png"
            alt="Logo BuscoCredito"
            className="w-[800px] animate__animated animate__fadeInDown animate__delay-0.5s object-contain"
            priority={true}
          />
        </div>

        {/* Text content */}
        <div className="text-center max-w-5xl px-4">
          <h1 className="animate__animated animate__fadeIn animate__delay-1s">
            <span className="block lg:text-6xl md:text-5xl text-4xl font-bold text-gray-800 mb-3">
              Encuentra las diferentes opciones
            </span>
            <span className="block lg:text-6xl md:text-5xl text-4xl font-bold text-gray-800">
              de préstamos que puedes tener
            </span>
          </h1>

          <p className="mt-8 text-xl text-gray-600 max-w-3xl mx-auto animate__animated animate__fadeIn animate__delay-1.5s leading-relaxed">
            Conectamos prestamistas y prestatarios para un mejor futuro
            financiero
          </p>
        </div>
      </div>
    </section>
  );
};

export default Introduction;
