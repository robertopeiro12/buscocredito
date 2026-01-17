import { Button } from "@heroui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MarketplacePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const MarketplacePagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: MarketplacePaginationProps) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={`flex items-center justify-center gap-1 mt-8 ${className}`}>
      <Button
        variant="light"
        size="sm"
        isIconOnly
        isDisabled={currentPage === 1}
        onPress={() => onPageChange(currentPage - 1)}
        className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {visiblePages.map((page, index) => (
        <div key={index}>
          {page === "..." ? (
            <span className="px-3 py-2 text-gray-400">...</span>
          ) : (
            <Button
              variant={currentPage === page ? "solid" : "light"}
              size="sm"
              color={currentPage === page ? "success" : "default"}
              onPress={() => onPageChange(page as number)}
              className={`min-w-10 h-10 ${
                currentPage === page
                  ? "bg-green-600 text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {page}
            </Button>
          )}
        </div>
      ))}

      <Button
        variant="light"
        size="sm"
        isIconOnly
        isDisabled={currentPage === totalPages}
        onPress={() => onPageChange(currentPage + 1)}
        className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};
