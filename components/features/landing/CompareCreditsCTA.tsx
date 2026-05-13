import Link from "next/link";
import { ArrowRight } from "lucide-react";

const CompareCreditsCTA = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-[#0e3a45] to-[#1a5c6e]">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6">
          Compara propuestas de crédito
        </h2>
        <p className="text-lg sm:text-xl text-green-100 max-w-2xl mx-auto mb-10 leading-relaxed">
          Recibe ofertas de múltiples instituciones financieras y elige la que
          mejor se adapte a tu situación. Sin compromisos, sin letra chiquita.
        </p>
        <Link
          href="/soluciones"
          className="inline-flex items-center gap-3 bg-[#2EA043] hover:bg-green-500 text-white text-lg sm:text-xl font-bold px-10 py-5 rounded-xl shadow-2xl hover:shadow-green-500/30 transform hover:-translate-y-1 transition-all duration-300"
        >
          Comienza a comparar tu crédito
          <ArrowRight className="w-6 h-6" />
        </Link>
      </div>
    </section>
  );
};

export default CompareCreditsCTA;
