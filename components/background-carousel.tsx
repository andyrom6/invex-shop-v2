import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface CarouselImage {
  src: string;
  alt: string;
  caption: string;
}

const images: CarouselImage[] = [
  { src: '/carousel/1.JPG', alt: 'Premium Digital Solutions', caption: 'eBay Orders' },
  { src: '/carousel/2.JPG', alt: 'Expert Marketing Tools', caption: 'Product Picture' },
  { src: '/carousel/3.JPG', alt: 'Business Analytics', caption: 'Reseller Win' },
  { src: '/carousel/4.JPG', alt: 'Enterprise Solutions', caption: '1:1 Dyson' },
  { src: '/carousel/5.JPG', alt: 'Digital Innovation', caption: 'Bulk Cologne Order' },
  { src: '/carousel/6.JPG', alt: 'Marketing Excellence', caption: 'Sp5der Hoodies' },
  { src: '/carousel/7.jpeg', alt: 'Professional Services', caption: 'Chromeheart Beanies' },
  { src: '/carousel/8.JPG ', alt: 'Growth Solutions', caption: 'Cologne Picture' },
  { src: '/carousel/9.jpeg', alt: 'Digital Transformation', caption: 'Reseller Win' },
  { src: '/carousel/10.jpeg', alt: 'Business Intelligence', caption: 'Airpods Bulk Order' },
  { src: '/carousel/11.jpeg', alt: 'Premium Digital Solutions', caption: '1:1 Rolex Watches' },
  { src: '/carousel/12.JPG', alt: 'Expert Marketing Tools', caption: 'Designer Bags' },
  { src: '/carousel/13.jpg', alt: 'Business Analytics', caption: 'Reseller Win' }
];

export const BackgroundCarousel = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Track mouse movement to add subtle 3D tilt to the center image
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

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [mounted]);

  // If not mounted, do not render anything
  if (!mounted) return null;

  // Return visible images along with their original indices
  const getVisibleImages = () => {
    const totalImages = images.length;
    const prevIndex = (currentIndex - 1 + totalImages) % totalImages;
    const nextIndex = (currentIndex + 1) % totalImages;
    
    return [
      { image: images[prevIndex], index: prevIndex },
      { image: images[currentIndex], index: currentIndex },
      { image: images[nextIndex], index: nextIndex }
    ];
  };

  const displayImages = getVisibleImages();

  return (
    <div 
      className="absolute inset-0 overflow-hidden flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
      onMouseMove={handleMouseMove}
    >
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900" />
      </div>
      
      {/* Subtle Grid Overlay */}
      <div className="absolute inset-0 backdrop-blur-[1px] bg-gradient-to-b from-transparent to-slate-950/50">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }} 
        />
      </div>
      
      {/* Sparkle Effects */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            initial={{ 
              x: Math.random() * 100 + '%',
              y: Math.random() * 100 + '%',
              scale: 0,
              opacity: 0 
            }}
            animate={{ 
              scale: [0, 1, 0],
              opacity: [0, 0.8, 0]
            }}
            transition={{ 
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>

      {/* Carousel Images */}
      <div className="relative w-full max-w-[1400px] h-[340px] md:h-[440px] mt-16 md:mt-20">
        {/* Side Decoration Lines */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[20%] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[20%] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        <div className="absolute inset-x-0 mx-auto flex justify-center items-center gap-8 md:gap-12 h-full">
          {displayImages.map(({ image, index }, i) => {
            const isCenter = i === 1; // Center image
            const isNext = i === 2;   // Next image
            // Previous image is i === 0
            return (
              <motion.div
                key={image.src}
                className="absolute w-[240px] md:w-[320px] h-[320px] md:h-[420px] group cursor-pointer"
                animate={{
                  scale: isCenter ? 1 : 0.85,
                  x: isCenter ? 0 : isNext ? 300 : -300,
                  y: isCenter ? 0 : 30,
                  rotateY: isCenter ? 0 : isNext ? 20 : -20,
                  opacity: isCenter ? 1 : 0.3,
                  zIndex: isCenter ? 10 : 0,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                onClick={() => setCurrentIndex(index)}
                whileHover={{
                  scale: isCenter ? 1.05 : 0.9,
                  y: isCenter ? -10 : 20,
                  transition: { duration: 0.2 }
                }}
              >
                <div 
                  className="relative w-full h-full rounded-3xl overflow-hidden transform-gpu transition-all duration-500 ease-out group-hover:scale-[1.02]"
                  style={{
                    transform: isCenter 
                      ? `rotateY(${mousePosition.x * 5}deg) rotateX(${-mousePosition.y * 5}deg) translateZ(30px)` 
                      : 'none',
                    transition: 'all 0.3s ease-out'
                  }}
                >
                  {/* Main Image Container */}
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl transform-gpu transition-all duration-500 group-hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)]">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover rounded-3xl transition-all duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                      sizes="(max-width: 768px) 300px, 400px"
                      quality={100}
                      priority={isCenter}
                    />
                  </div>

                  {/* Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/30 to-slate-900/90 rounded-3xl opacity-60 group-hover:opacity-40 transition-all duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-slate-900/10 to-purple-500/10 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-3xl" />

                  {/* Caption */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <h3 className="text-white text-lg font-medium tracking-wide mb-2">{image.caption}</h3>
                    <div className="h-0.5 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 group-hover:w-20" />
                  </div>
                </div>

                {isCenter && (
                  <motion.div
                    className="absolute inset-0 ring-2 ring-white/20 rounded-3xl"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-30">
        {images.map((_, index) => {
          const isCurrent = index === currentIndex;
          return (
            <motion.button
              key={index}
              className="group relative py-3 px-2"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentIndex(index)}
            >
              <motion.div
                className={`w-8 h-0.5 rounded-full transition-all duration-300 ${
                  isCurrent 
                    ? 'bg-white w-8' 
                    : 'bg-white/30 w-6 group-hover:bg-white/50'
                }`}
                layoutId={`dot-${index}`}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            </motion.button>
          );
        })}
      </div>

      {/* Arrow Navigation */}
      <motion.button
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 shadow-lg flex items-center justify-center z-30 backdrop-blur-sm"
        whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)}
      >
        <svg className="w-6 h-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </motion.button>

      <motion.button
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 shadow-lg flex items-center justify-center z-30 backdrop-blur-sm"
        whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
      >
        <svg className="w-6 h-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </motion.button>
    </div>
  );
};
