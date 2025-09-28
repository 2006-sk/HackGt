const Reviews = () => {
  const reviews = [
    {
      id: 1,
      name: "Dr. John Davis",
      role: "Cardiologist",
      photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face",
      text: "This platform has revolutionized how I monitor my patients. The real-time data and AI insights have improved outcomes significantly."
    },
    {
      id: 2,
      name: "Sarah Miller",
      role: "Patient",
      photo: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      text: "The telemedicine feature saved me so much time. I can consult with my doctor from home without any hassle."
    },
    {
      id: 3,
      name: "Dr. Maria Rodriguez",
      role: "Pediatrician",
      photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
      text: "The mobile-first design makes it so easy to access patient records on the go. Game changer for busy practices."
    },
    {
      id: 4,
      name: "Tom Wilson",
      role: "Patient",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      text: "The AI diagnostics caught something my previous doctor missed. This technology is truly life-saving."
    },
    {
      id: 5,
      name: "Dr. Amy Lee",
      role: "Family Medicine",
      photo: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face",
      text: "The secure data management gives me peace of mind. Patient privacy is handled perfectly."
    }
  ];


  const ReviewCard = ({ review }) => (
    <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 p-8 rounded-2xl shadow-2xl shadow-black/50 border border-gray-700/50 w-80 flex-shrink-0">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4">
          <img 
            src={review.photo} 
            alt={review.name}
            className="w-full h-full object-cover rounded-full border-2 border-gray-600"
          />
        </div>
        <div>
          <h4 className="font-semibold text-white">{review.name}</h4>
          <p className="text-gray-300 text-sm">{review.role}</p>
        </div>
      </div>
      <div className="flex text-yellow-400 mb-3">
        {'★'.repeat(5)}
      </div>
      <p className="text-gray-200 italic">
        "{review.text}"
      </p>
    </div>
  );

  return (
    <section id="reviews" className="py-20 bg-transparent">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">Trusted by People</h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            See what our patients and healthcare providers are saying about our platform
          </p>
        </div>

        {/* Moving Carousel */}
        <div className="relative overflow-hidden">
          <div className="flex animate-scroll gap-6">
            {/* First set of reviews */}
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
            
            {/* Duplicate set for seamless loop */}
            {reviews.map((review) => (
              <ReviewCard key={`duplicate-${review.id}`} review={review} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reviews;
