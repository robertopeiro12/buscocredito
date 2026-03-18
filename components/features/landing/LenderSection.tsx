"use client";

import Image from "next/image";
import Link from "next/link";

const LenderSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="rounded-3xl overflow-hidden shadow-2xl h-[400px] md:h-[500px] relative">
            <Image
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=800&fit=crop"
              alt="Hombre de negocios sonriendo"
              fill
              className="object-cover object-top"
            />
          </div>

          {/* Content */}
          <div className="md:pl-8">
            <h2 className="font-display text-4xl font-bold text-gray-900 mb-6">
              ¿Ofreces créditos?
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              BuscoCrédito también conecta prestamistas con personas que buscan
              financiamiento de forma directa y organizada.
            </p>
            <Link
              href="/prestamista"
              className="inline-block bg-green-100 hover:bg-green-200 text-green-900 font-bold text-sm py-3 px-8 rounded-full transition uppercase tracking-wide"
            >
              Conoce cómo funciona para prestamistas
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LenderSection;
