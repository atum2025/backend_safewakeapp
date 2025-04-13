import logoImage from "../assets/Logo_SW.png";

interface LogoProps {
  size?: "sm" | "md" | "lg";
}

export const Logo = ({ size = "md" }: LogoProps) => {
  // Size mapping - aumentado 1x em cada tamanho
  const sizeMap = {
    sm: {
      containerSize: "w-28 h-20",
      imgSize: "h-16 w-auto"
    },
    md: {
      containerSize: "w-40 h-28",
      imgSize: "h-24 w-auto"
    },
    lg: {
      containerSize: "w-56 h-40",
      imgSize: "h-32 w-auto"
    }
  };

  const { containerSize, imgSize } = sizeMap[size];

  return (
    <div className={`${containerSize} flex items-center justify-center`}>
      <img src={logoImage} alt="SafeWake Logo" className={`${imgSize} object-contain`} />
    </div>
  );
};

export default Logo;
