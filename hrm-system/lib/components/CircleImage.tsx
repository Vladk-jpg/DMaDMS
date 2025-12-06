import NextImage from "next/image";

interface CircleImageProps {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}

export default function CircleImage({
  src,
  alt,
  size = 128,
  className = "",
}: CircleImageProps) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <NextImage
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="w-full h-full rounded-full object-cover border-2 border-white"
        unoptimized
      />
    </div>
  );
}
