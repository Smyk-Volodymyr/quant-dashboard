import React from "react";
import { Separator } from "react-resizable-panels";

interface ResizeHandleProps {
  direction?: "horizontal" | "vertical";
  className?: string;
}

export function ResizeHandle({ direction = "horizontal", className = "" }: ResizeHandleProps) {
  const isHorizontal = direction === "horizontal";

  return (
    <Separator
      className={`group flex items-center justify-center bg-[#09090b] outline-none transition-colors hover:bg-slate-800/50 focus-visible:ring-1 focus-visible:ring-blue-500 ${isHorizontal ? "w-2 cursor-col-resize" : "h-2 cursor-row-resize"
        } ${className}`}
    >
      {/* Маленька лінія/крапка по центру для візуальної підказки */}
      <div
        className={`bg-slate-700 rounded-full transition-colors group-hover:bg-blue-500 ${isHorizontal ? "w-1 h-8" : "h-1 w-8"
          }`}
      />
    </Separator>
  );
}