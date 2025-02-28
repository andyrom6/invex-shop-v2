import { useEffect, useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Sparkles, ImageIcon, Phone } from 'lucide-react';

export interface CarouselImage {
  id: string;
  src: string;
  alt: string;
  caption: string;
}

interface BackgroundCarouselProps {
  customImages?: CarouselImage[];
  autoPlay?: boolean;
  interval?: number;
}

// Memoized background effects component to reduce re-renders
const BackgroundEffects = memo(() => {
  const [laserBeams, setLaserBeams] = useState<Array<{
    id: number;
    top: string;
    left: string;
    width: string;
    rotation: string;
    animationProps: {
      opacity: number[];
      left: string[];
      top: string[];
      width: string[];
    };
    duration: number;
    delay: number;
  }>>([]);

  const [particles, setParticles] = useState<Array<{
    id: number;
    top: string;
    left: string;
    size: number;
    animationY: number[];
    animationX: number[];
    duration: number;
  }>>([]);

  // Generate animations only on client-side
  useEffect(() => {
    // Generate laser beams
    const beams = Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      width: `${Math.random() * 200 + 100}px`,
      rotation: `rotate(${Math.random() * 360}deg)`,
      animationProps: {
        opacity: [0, 0.8, 0],
        left: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
        top: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
        width: [`${Math.random() * 100 + 50}px`, `${Math.random() * 300 + 100}px`],
      },
      duration: 2 + Math.random() * 4,
      delay: Math.random() * 8 + 2,
    }));
    
    setLaserBeams(beams);

    // Generate floating particles
    const particlesData = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 4 + 1,
      animationY: [0, Math.random() * 150 - 75],
      animationX: [0, Math.random() * 100 - 50],
      duration: 10 + Math.random() * 20,
    }));
    
    setParticles(particlesData);
  }, []);

  return (
    <>
      {/* Futuristic Animated Background with Dynamic Gradients */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Cyberpunk-inspired gradient background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.3),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(168,85,247,0.3),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/40 to-slate-900/70" />
        
        {/* Animated neon orbs with enhanced glow */}
        <div className="absolute top-1/4 right-1/4 w-80 h-80 rounded-full bg-blue-500/30 blur-3xl animate-pulse" 
             style={{ animationDuration: '8s', filter: 'drop-shadow(0 0 15px rgba(59,130,246,0.3))' }} />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 rounded-full bg-purple-500/30 blur-3xl animate-pulse" 
             style={{ animationDuration: '12s', animationDelay: '2s', filter: 'drop-shadow(0 0 15px rgba(168,85,247,0.3))' }} />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full bg-cyan-500/20 blur-3xl animate-pulse" 
             style={{ animationDuration: '15s', animationDelay: '1s', filter: 'drop-shadow(0 0 15px rgba(14,165,233,0.3))' }} />
             
        {/* Client-side rendered animated laser beams */}
        <div className="absolute w-full h-full">
          {laserBeams.map((beam) => (
            <motion.div
              key={`laser-${beam.id}`}
              className="absolute h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent"
              style={{
                top: beam.top,
                left: beam.left,
                width: beam.width,
                transform: beam.rotation,
                filter: 'drop-shadow(0 0 5px rgba(59,130,246,0.8))',
                opacity: 0.7,
              }}
              animate={{
                opacity: beam.animationProps.opacity,
                left: beam.animationProps.left,
                top: beam.animationProps.top,
                width: beam.animationProps.width,
              }}
              transition={{
                duration: beam.duration,
                repeat: Infinity,
                repeatDelay: beam.delay,
              }}
            />
          ))}
        </div>
        
        {/* Digital circuit lines */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="circuit-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M20 20 H80 V80 H20 Z" fill="none" stroke="rgba(59,130,246,0.5)" strokeWidth="1" />
                <path d="M50 20 V80" fill="none" stroke="rgba(59,130,246,0.5)" strokeWidth="1" />
                <path d="M20 50 H80" fill="none" stroke="rgba(59,130,246,0.5)" strokeWidth="1" />
                <circle cx="50" cy="50" r="3" fill="rgba(59,130,246,0.8)" />
                <circle cx="20" cy="20" r="2" fill="rgba(168,85,247,0.8)" />
                <circle cx="80" cy="80" r="2" fill="rgba(168,85,247,0.8)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuit-pattern)" />
          </svg>
        </div>
      </div>
      
      {/* Futuristic Grid Overlay with enhanced depth */}
      <div className="absolute inset-0 backdrop-blur-[1px] bg-gradient-to-b from-transparent to-slate-950/40">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `linear-gradient(to right, rgba(59,130,246,0.1) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(59,130,246,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }} 
        />
      </div>
      
      {/* Client-side rendered enhanced floating particles with glow */}
      <div className="absolute inset-0 opacity-40">
        {particles.map((particle) => (
          <motion.div
            key={`particle-${particle.id}`}
            className="absolute rounded-full bg-white"
            style={{
              top: particle.top,
              left: particle.left,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.8))',
            }}
            animate={{
              y: particle.animationY,
              x: particle.animationX,
              opacity: [0, 0.9, 0],
              scale: [0, Math.random() + 0.5, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>
    </>
  );
});

BackgroundEffects.displayName = 'BackgroundEffects';

// Memoized sparkle effects component with enhanced visuals
const SparkleEffects = memo(() => {
  const [sparkles, setSparkles] = useState<Array<{
    id: number;
    x: string;
    y: string;
    scale: number[];
    opacity: number[];
    duration: number;
    delay: number;
  }>>([]);

  // Generate sparkles only on client-side
  useEffect(() => {
    const sparklesData = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 100}%`,
      scale: [0, Math.random() * 0.7 + 0.5, 0],
      opacity: [0, Math.random() * 0.7 + 0.3, 0],
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 5,
    }));
    
    setSparkles(sparklesData);
  }, []);

  if (sparkles.length === 0) return null;

  return (
    <div className="absolute inset-0">
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            boxShadow: '0 0 10px 2px rgba(255,255,255,0.8), 0 0 20px 6px rgba(59,130,246,0.4)',
            left: sparkle.x,
            top: sparkle.y,
          }}
          initial={{ 
            scale: 0,
            opacity: 0 
          }}
          animate={{ 
            scale: sparkle.scale,
            opacity: sparkle.opacity
          }}
          transition={{ 
            duration: sparkle.duration,
            repeat: Infinity,
            delay: sparkle.delay
          }}
        />
      ))}
    </div>
  );
});

SparkleEffects.displayName = 'SparkleEffects';

// Placeholder component when no images are available
const NoImagesPlaceholder = memo(() => (
  <div className="relative w-full max-w-[320px] aspect-[9/16] rounded-3xl overflow-hidden bg-gradient-to-b from-slate-800 to-slate-900 flex flex-col items-center justify-center text-center p-8 border-8 border-slate-700 shadow-2xl">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-700 rounded-b-xl"></div>
    <Phone className="w-16 h-16 text-slate-600 mb-4" />
    <h3 className="text-xl font-medium text-slate-400 mb-2">No images found</h3>
    <p className="text-slate-500 max-w-xs">
      Add images through the admin dashboard
    </p>
  </div>
));

NoImagesPlaceholder.displayName = 'NoImagesPlaceholder';

// Variants for slide animations
const slideVariants = {
  enter: (direction: number) => ({
    y: direction > 0 ? '30%' : '-30%',
    opacity: 0,
    scale: 0.9,
  }),
  center: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      y: { type: 'spring', stiffness: 300, damping: 30 },
      opacity: { duration: 0.4 },
      scale: { duration: 0.4 }
    }
  },
  exit: (direction: number) => ({
    y: direction > 0 ? '-30%' : '30%',
    opacity: 0,
    scale: 0.9,
    transition: {
      y: { type: 'spring', stiffness: 300, damping: 30 },
      opacity: { duration: 0.4 },
      scale: { duration: 0.4 }
    }
  })
};

// Main carousel component
const BackgroundCarouselComponent = ({ 
  customImages,
  autoPlay = true,
  interval = 5000
}: BackgroundCarouselProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [images, setImages] = useState<CarouselImage[]>(customImages || []);
  const [loading, setLoading] = useState(!customImages);
  const [previousIndex, setPreviousIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const [hasImages, setHasImages] = useState(customImages ? customImages.length > 0 : false);

  // Fetch carousel images from API if no custom images are provided
  useEffect(() => {
    if (!customImages) {
      console.info('Fetching carousel images from API');
      fetch('/api/carousel')
        .then(res => res.json())
        .then(data => {
          if (data && Array.isArray(data) && data.length > 0) {
            console.info(`Retrieved ${data.length} carousel images`);
            setImages(data);
            setHasImages(true);
          } else {
            console.info('No carousel images found in API');
            setHasImages(false);
          }
        })
        .catch(error => {
          console.error('Error fetching carousel images:', error);
          setHasImages(false);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setHasImages(customImages.length > 0);
    }
  }, [customImages]);

  // Track mouse movement for 3D parallax effect
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = (clientX - left) / width - 0.5;
    const y = (clientY - top) / height - 0.5;
    setMousePosition({ x, y });
  };

  // Set mounted state to true on first render
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-advance carousel every interval ms
  useEffect(() => {
    if (!mounted || !autoPlay || isHovering || !hasImages || images.length === 0) return;
    
    const intervalId = setInterval(() => {
      setPreviousIndex(currentIndex);
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);
    
    return () => clearInterval(intervalId);
  }, [mounted, autoPlay, isHovering, interval, images.length, currentIndex, hasImages]);

  // If not mounted or loading, show a modern loading animation
  if (!mounted || loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-blue-600/20 border-t-blue-600 animate-spin"></div>
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400 w-8 h-8 animate-pulse" />
        </div>
      </div>
    );
  }

  // Handle navigation
  const goToPrevious = () => {
    if (!hasImages || images.length === 0) return;
    setPreviousIndex(currentIndex);
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    if (!hasImages || images.length === 0) return;
    setPreviousIndex(currentIndex);
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToSlide = (index: number) => {
    if (!hasImages || images.length === 0) return;
    setPreviousIndex(currentIndex);
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  return (
    <div 
      className="w-full h-full min-h-[600px] flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Background with enhanced parallax effect */}
      <div 
        className="absolute inset-0 w-full h-full"
          style={{
          transform: `translateX(${mousePosition.x * -25}px) translateY(${mousePosition.y * -25}px)`,
          transition: 'transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1)',
          }} 
      >
        <BackgroundEffects />
      </div>
      
      <SparkleEffects />

      {/* Enhanced Glassmorphism container with neon border */}
      <div className="relative z-10 w-full max-w-[1200px] px-6 py-12 mx-auto rounded-3xl bg-white/5 backdrop-blur-md border border-blue-400/20 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
        {/* Neon accent lines */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-t-3xl opacity-70"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-b-3xl opacity-70"></div>
        
        {/* Main Carousel - Portrait Phone Format */}
        <div className="relative w-full flex flex-row items-center justify-center gap-10">
          {hasImages && images.length > 0 ? (
            <>
              {/* Left Navigation */}
              <motion.button
                className="relative z-20 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-70 hover:opacity-100 focus:opacity-100 transition-all border border-white/20 shadow-lg hover:shadow-blue-500/20 hover:border-blue-400/50"
                whileHover={{ scale: 1.15, boxShadow: '0 0 15px rgba(59,130,246,0.4)' }}
                whileTap={{ scale: 0.9 }}
                onClick={goToPrevious}
              >
                <ChevronLeft className="w-7 h-7 text-white" />
              </motion.button>

              {/* Carousel Item */}
              <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="flex justify-center items-center"
              >
                <div 
                    className="relative w-full max-w-[320px] aspect-[9/16] rounded-3xl overflow-hidden transform-gpu transition-all duration-500 ease-out group shadow-2xl"
                  style={{
                      transform: `perspective(1000px) rotateY(${mousePosition.x * 8}deg) rotateX(${-mousePosition.y * 8}deg) translateZ(30px)`,
                      transformStyle: 'preserve-3d',
                      transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
                      height: '100%',
                      minHeight: '500px',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(59, 130, 246, 0.3)'
                    }}
                  >
                    {/* Futuristic Phone Frame with enhanced realism */}
                    <div className="absolute inset-0 border-[12px] border-gray-800 rounded-3xl z-30 pointer-events-none shadow-inner">
                      {/* Phone notch */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-gray-800 rounded-b-xl"></div>
                      {/* Camera */}
                      <div className="absolute top-2 right-[40%] w-3 h-3 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-900"></div>
                      </div>
                      {/* Speaker */}
                      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-16 h-1 bg-gray-700 rounded-full"></div>
                      {/* Volume buttons */}
                      <div className="absolute top-20 -left-[14px] w-2 h-12 bg-gray-700 rounded-l-md"></div>
                      <div className="absolute top-40 -left-[14px] w-2 h-12 bg-gray-700 rounded-l-md"></div>
                      {/* Power button */}
                      <div className="absolute top-24 -right-[14px] w-2 h-14 bg-gray-700 rounded-r-md"></div>
                      
                      {/* Subtle inner glow */}
                      <div className="absolute inset-[1px] rounded-2xl opacity-30 pointer-events-none" 
                           style={{ boxShadow: 'inset 0 0 15px rgba(59, 130, 246, 0.3)' }}></div>
                    </div>

                    {/* Main Image Container with enhanced 3D effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-800 rounded-2xl transform-gpu transition-all duration-500 group-hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
                      <div className="relative w-full h-full">
                    <Image
                          src={images[currentIndex].src}
                          alt={images[currentIndex].alt}
                          fill
                          className="object-contain transition-all duration-700 group-hover:scale-105 opacity-100"
                          sizes="(max-width: 768px) 100vw, 320px"
                          quality={90}
                          priority
                        />
                      </div>
                    </div>

                    {/* Enhanced overlay with subtle gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/5 to-slate-900/30 rounded-2xl opacity-30 group-hover:opacity-10 transition-all duration-500" />
                    
                    {/* Enhanced light reflection effect */}
                    <div 
                      className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-all duration-700 rounded-2xl"
                      style={{
                        transform: `translateX(${mousePosition.x * 70}px) translateY(${mousePosition.y * 70}px)`,
                        transition: 'all 0.3s ease-out'
                      }}
                    />

                    {/* Futuristic Caption with better typography and animations */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-0 opacity-100 transition-all duration-500 group-hover:translate-y-[-8px] z-20 bg-gradient-to-t from-black/60 to-transparent">
                      <h3 className="text-xl font-medium tracking-wide mb-3 text-white group-hover:text-blue-100 transition-colors">{images[currentIndex].caption}</h3>
                      <div className="h-0.5 w-16 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-full transition-all duration-500 group-hover:w-32 group-hover:h-1 group-hover:shadow-[0_0_10px_rgba(59,130,246,0.7)]" />
                  </div>

                    {/* Interactive screen reflection */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 rounded-2xl pointer-events-none" />
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Right Navigation */}
              <motion.button
                className="relative z-20 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-70 hover:opacity-100 focus:opacity-100 transition-all border border-white/20 shadow-lg hover:shadow-blue-500/20 hover:border-blue-400/50"
                whileHover={{ scale: 1.15, boxShadow: '0 0 15px rgba(59,130,246,0.4)' }}
                whileTap={{ scale: 0.9 }}
                onClick={goToNext}
              >
                <ChevronRight className="w-7 h-7 text-white" />
              </motion.button>
            </>
          ) : (
            <div className="flex justify-center items-center">
              <NoImagesPlaceholder />
                </div>
          )}
        </div>
      </div>

      {/* Enhanced Navigation Dots - Only show if there are images */}
      {hasImages && images.length > 0 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30 px-3 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-sm transition-all duration-300">
        {images.map((_, index) => {
          const isCurrent = index === currentIndex;
          return (
            <motion.button
              key={index}
                className="group relative py-1 px-1"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
                onClick={() => goToSlide(index)}
            >
              <motion.div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                  isCurrent 
                      ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 w-6 shadow-[0_0_5px_rgba(59,130,246,0.5)]' 
                      : 'bg-white/20 w-4 group-hover:bg-white/40'
                }`}
                layoutId={`dot-${index}`}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            </motion.button>
          );
        })}
      </div>
      )}
    </div>
  );
};

// Export memoized component to prevent unnecessary re-renders
export const BackgroundCarousel = memo(BackgroundCarouselComponent);
