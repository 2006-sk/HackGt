import { FlipWords } from './ui/flip-words';
import Spline from '@splinetool/react-spline';

const Hero = () => {
  const words = ["smart", "reliable", "compassionate"];

  return (
    <section id="hero" className="relative h-screen w-full overflow-hidden">
      {/* Content Overlay */}
      <div className="relative z-10 h-full flex items-center">
        <div className="text-left text-gray-900 max-w-7xl mx-auto px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <div className="space-y-6">
              <div className="mb-6">
                <h1 className="text-6xl md:text-8xl font-black leading-[0.85] tracking-[-0.02em] mb-4 text-gray-900">
                  Welcome to
                </h1>
                <h1 className="text-6xl md:text-8xl font-black leading-[0.85] tracking-[-0.02em] text-purple-600">
                  MedTech
                </h1>
              </div>
              
              <div className="space-y-4">
                <div className="text-4xl md:text-5xl font-extralight leading-[0.9] tracking-[-0.01em]">
                  <span className="text-purple-600">A</span>
                  <FlipWords 
                    words={words} 
                    className="text-purple-700 font-medium mx-3 tracking-wide"
                    duration={2500}
                  />
                  <span className="text-purple-600">System</span>
                </div>
                <p className="text-xl md:text-2xl font-light text-gray-700 leading-[1.3] max-w-4xl opacity-95 tracking-wide">
                  to reduce patient readmission and support safer recoveries
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6 pt-8">
                  <button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-10 py-4 rounded-xl text-lg font-medium tracking-wide transition-all duration-300 hover:scale-105 shadow-xl shadow-purple-500/25 hover:shadow-purple-400/40">
                    Get Started
                  </button>
                  <button className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-10 py-4 rounded-xl text-lg font-medium tracking-wide transition-all duration-300 hover:scale-105 backdrop-blur-sm">
                    Learn More
                  </button>
                </div>
              </div>
            </div>

            {/* Right side - 3D Spline element */}
            <div className="hidden lg:block h-[600px] w-full ml-8">
              <Spline
                scene="https://prod.spline.design/FmIpyvwh5PmxcPtQ/scene.splinecode"
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
