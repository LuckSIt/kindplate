import React from "react";
import image from "@/figma/image.png";

export const Box = (): JSX.Element => {
  return (
    <div className="w-[402px] h-[874px] relative">
      <img
        className="absolute top-0 left-0 w-[402px] h-[874px] object-cover"
        alt="Background image"
        src={image}
      />
    </div>
  );
};

