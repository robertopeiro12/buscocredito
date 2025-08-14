import React from "react";
import { Select, SelectProps } from "@nextui-org/react";

// Componente Select personalizado con flechas más visibles
export const CustomSelect = React.forwardRef<HTMLSelectElement, SelectProps>(
  (props, ref) => {
    return (
      <div className="custom-select-wrapper">
        <Select
          ref={ref}
          {...props}
          classNames={{
            ...props.classNames,
            selectorIcon: `text-gray-800 text-xl font-black ${
              props.classNames?.selectorIcon || ""
            }`,
            trigger: `bg-white border-gray-300 border-2 ${
              props.classNames?.trigger || ""
            }`,
          }}
          style={{
            ...props.style,
          }}
        />
        <style jsx>{`
          .custom-select-wrapper :global([data-slot="selectorIcon"]) {
            color: #1f2937 !important;
            font-size: 20px !important;
            font-weight: 900 !important;
            stroke-width: 3 !important;
          }

          .custom-select-wrapper :global([data-slot="selectorIcon"] svg) {
            color: #1f2937 !important;
            width: 20px !important;
            height: 20px !important;
            stroke-width: 3 !important;
          }
        `}</style>
      </div>
    );
  }
);

CustomSelect.displayName = "CustomSelect";
