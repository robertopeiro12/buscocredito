import { useState } from "react";
import { Button } from "@nextui-org/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const delta = 1; // Páginas a mostrar a cada lado de la actual

    // Primera página
    pages.push(1);

    // Puntos suspensivos iniciales
    if (currentPage - delta > 2) {
      pages.push("...");
    }

    // Páginas alrededor de la actual
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      pages.push(i);
    }

    // Puntos suspensivos finales
    if (currentPage + delta < totalPages - 1) {
      pages.push("...");
    }

    // Última página (si no es la primera)
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {/* Botón anterior */}
      <Button
        isIconOnly
        variant="light"
        size="sm"
        isDisabled={currentPage === 1}
        onPress={() => onPageChange(currentPage - 1)}
        className="text-gray-600 hover:text-gray-900"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {/* Números de página */}
      {getVisiblePages().map((page, index) => (
        <Button
          key={index}
          variant={page === currentPage ? "solid" : "light"}
          size="sm"
          className={
            page === currentPage
              ? "bg-green-600 text-white"
              : typeof page === "number"
              ? "text-gray-600 hover:text-gray-900"
              : "text-gray-400 cursor-default"
          }
          onPress={() => typeof page === "number" ? onPageChange(page) : undefined}
          isDisabled={typeof page !== "number"}
        >
          {page}
        </Button>
      ))}

      {/* Botón siguiente */}
      <Button
        isIconOnly
        variant="light"
        size="sm"
        isDisabled={currentPage === totalPages}
        onPress={() => onPageChange(currentPage + 1)}
        className="text-gray-600 hover:text-gray-900"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};
