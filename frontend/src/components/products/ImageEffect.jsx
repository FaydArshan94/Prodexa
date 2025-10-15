import React, { useState } from "react";
import Image from "next/image";

const MAGNIFIER_SIZE = 150;
const ZOOM_LEVEL = 2;

const ImageEffect = ({ src, alt = "" }) => {
  const [zoomable, setZoomable] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [position, setPosition] = useState({ x: 100, y: 100, mouseX: 0, mouseY: 0 });

  const handleMouseEnter = (e) => {
    const element = e.currentTarget;
    const { width, height } = element.getBoundingClientRect();
    setImageSize({ width, height });
    setZoomable(true);
    updatePosition(e);
  };

  const handleMouseLeave = (e) => {
    setZoomable(false);
    updatePosition(e);
  };

  const handleMouseMove = (e) => {
    updatePosition(e);
  };

  const updatePosition = (e) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    setPosition({
      x: -x * ZOOM_LEVEL + MAGNIFIER_SIZE / 2,
      y: -y * ZOOM_LEVEL + MAGNIFIER_SIZE / 2,
      mouseX: x - MAGNIFIER_SIZE / 2,
      mouseY: y - MAGNIFIER_SIZE / 2,
    });
  };

  return (
    <div className="flex justify-center items-center">
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        className="w-[30rem] h-[30rem] relative overflow-hidden"
      >
        <Image className="object-cover border z-10" alt={alt} src={src} fill sizes="h-full w-full" />
        <div
          style={{
            backgroundPosition: `${position.x}px ${position.y}px`,
            backgroundImage: `url(${src})`,
            backgroundSize: `${imageSize.width * ZOOM_LEVEL}px ${imageSize.height * ZOOM_LEVEL}px`,
            backgroundRepeat: "no-repeat",
            display: zoomable ? "block" : "none",
            top: `${position.mouseY}px`,
            left: `${position.mouseX}px`,
            width: `${MAGNIFIER_SIZE}px`,
            height: `${MAGNIFIER_SIZE}px`,
          }}
          className="z-50 border-2 rounded-full pointer-events-none absolute border-blue-500"
        />
      </div>
    </div>
  );
};

export default ImageEffect;
