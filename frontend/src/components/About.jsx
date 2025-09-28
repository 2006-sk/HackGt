import { ContainerScroll, Header, Card } from './ui/container-scroll-animation';
import { CardSpotlight } from './ui/card-spotlight';

const About = () => {
  const titleComponent = (
    <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8">
      What we believe <span className="text-4xl md:text-6xl font-bold text-purple-600 mb-8">IN</span>
    </h2>
  );

  return (
    <section id="about" className="bg-transparent py-20">
      <ContainerScroll titleComponent={titleComponent}>
        <div className="grid md:grid-cols-2 gap-8 h-full">
          {/* Mission Statement Card */}
          <CardSpotlight 
            className="h-full p-8 rounded-2xl border border-white/20 bg-black/80 backdrop-blur-xl"
            color="#7c3aed"
          >
            <div className="h-full flex flex-col justify-center">
              <h3 className="text-3xl font-bold text-white mb-6">Our Mission</h3>
              <p className="text-lg text-purple-100 leading-relaxed mb-8">
                To empower patients and healthcare providers with cutting-edge technology that makes healthcare more accessible, efficient, and personalized. We believe that everyone deserves quality healthcare, regardless of their location or circumstances.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-white mb-2">Patient-Centered Care</h4>
                    <p className="text-purple-100">Putting patients at the center of every decision and innovation.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-white mb-2">Innovation & Technology</h4>
                    <p className="text-purple-100">Leveraging the latest technology to improve healthcare outcomes.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-white mb-2">Accessibility</h4>
                    <p className="text-purple-100">Making quality healthcare accessible to everyone, everywhere.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardSpotlight>

          {/* Platform Features Card */}
          <CardSpotlight 
            className="h-full p-8 rounded-2xl border border-white/20 bg-black/80 backdrop-blur-xl"
            color="#7c3aed"
          >
            <div className="h-full flex flex-col justify-center">
              <h3 className="text-3xl font-bold text-white mb-6">Platform Features</h3>
              <p className="text-lg text-purple-100 leading-relaxed mb-8">
                Our comprehensive platform offers cutting-edge features designed to revolutionize healthcare delivery and improve patient outcomes.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-white text-lg">Real-time patient monitoring</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-white text-lg">AI-powered diagnostics</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-white text-lg">Telemedicine capabilities</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-white text-lg">Secure data management</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-white text-lg">Mobile-first design</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-white text-lg">24/7 support system</span>
                </div>
              </div>
            </div>
          </CardSpotlight>
        </div>
      </ContainerScroll>
    </section>
  );
};

export default About;