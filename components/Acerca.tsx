import React from "react";
import Image from "next/image";

const Acerca = () => {
  return (
    <section className="w-full bg-white py-16" id="acerca">
      <div className="lg:max-w-6xl mx-auto max-w-lg px-5 lg:px-0">
        <h2 className="text-4xl lg:text-5xl font-bold mb-12 text-green-600">
          Acerca de la plataforma
        </h2>
        <div className="flex lg:flex-row flex-col items-start justify-between">
          <p className="text-gray-700 text-xl lg:text-2xl lg:text-start text-center lg:max-w-3xl leading-relaxed">
            La plataforma de BuscoCredito está hecha con el fin de que las
            personas puedan encontrar las diferentes opciones de préstamos que
            los bancos les pueden ofrecer, simplemente ingresando el tipo de
            préstamo y la cantidad que requiere.
          </p>
          <div className="lg:w-[300px] w-full mt-8 lg:mt-0">
            <Image
              width={300}
              height={200}
              src="/img/prestamo.avif"
              alt="Acerca"
              className="w-full h-auto rounded-lg border-4 border-green-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Acerca;
