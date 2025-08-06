import { cn } from "@/utils/shadcn-utils";
import React, { CSSProperties } from "react";
import { ClipLoader } from "react-spinners";

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  speedMultiplier?: number;
  cssOverride?: CSSProperties;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 50,
  color = "#0d3489",
  speedMultiplier = 1,
  className = "",
  cssOverride = {},
}) => {
  return (
    <div className={cn(className)}>
      <ClipLoader
        loading={true}
        size={size}
        color={color}
        speedMultiplier={speedMultiplier}
        cssOverride={cssOverride}
      />
    </div>
  );
};

export default LoadingSpinner;
