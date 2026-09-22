import { useRef } from "react"
import { motion, useAnimation, useInView, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"; 
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { apiService } from "../utils/api";
import { useState, useEffect } from "react";

// Custom Button component with enhanced animations
const Button = ({ children, className = "", variant = "default", size = "default", ...props }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(5, 150, 105, 0.4)" }}
      whileTap={{ scale: 0.98 }}
      className={`inline-flex items-center justify-center rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300 disabled:pointer-events-none disabled:opacity-50 ${
        variant === "default" ? "bg-green-600 text-white hover:bg-green-700" : 
        variant === "outline" ? "border-2 border-green-600 text-green-600 hover:bg-green-50" :
        variant === "ghost" ? "text-green-600 hover:bg-green-50" : ""
      } ${
        size === "lg" ? "h-12 px-8 text-lg" :
        size === "md" ? "h-10 px-6" :
        "h-8 px-4 text-sm"
      } ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}

// Enhanced Card components with glass morphism effect
const Card = ({ className = "", ...props }) => {
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className={`rounded-2xl bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all ${className}`}
      {...props}
    />
  )
}

const CardContent = ({ className = "", ...props }) => {
  return <div className={`p-6 ${className}`} {...props} />
}

// Enhanced Icons with subtle animations
const ArrowRight = () => (
  <motion.svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4 ml-2"
    initial={{ x: 0 }}
    animate={{ x: [0, 4, 0] }}
    transition={{ duration: 1.5, repeat: Infinity }}
  >
    <path d="M5 12h14"></path>
    <path d="m12 5 7 7-7 7"></path>
  </motion.svg>
)

const ChevronDown = () => (
  <motion.svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-8 h-8 text-green-600"
    animate={{ y: [0, 10, 0] }}
    transition={{ duration: 2, repeat: Infinity }}
  >
    <path d="m6 9 6 6 6-6"></path>
  </motion.svg>
)

const Recycle = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-10 h-10 text-green-600"
  >
    <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"></path>
    <path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12"></path>
    <path d="m14 16-3 3 3 3"></path>
    <path d="M8.293 13.596 4.875 9.5l3.418-4.096"></path>
    <path d="m7.14 9.5 5.858 8.518a1.83 1.83 0 0 0 1.56.882c.56 0 1.08-.3 1.356-.788l4.035-6.989a1.785 1.785 0 0 0 .01-1.778A1.83 1.83 0 0 0 18.375 8.5H14"></path>
    <path d="m13 8 3-3-3-3"></path>
  </svg>
)

const ShoppingBag = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-10 h-10 text-green-600"
  >
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
    <path d="M3 6h18"></path>
    <path d="M16 10a4 4 0 0 1-8 0"></path>
  </svg>
)

const Leaf = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-10 h-10 text-green-600"
  >
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
  </svg>
)

const TrendingUp = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-10 h-10 text-green-600"
  >
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
    <polyline points="16 7 22 7 22 13"></polyline>
  </svg>
)

// Enhanced FadeInSection with parallax effect
const FadeInSection = ({ children, delay = 0, className = "" }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const controls = useAnimation()

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [isInView, controls])

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 40, scale: 0.95 },
        visible: { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          transition: { 
            duration: 0.8, 
            delay,
            ease: [0.2, 0.65, 0.3, 0.9]
          } 
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Particle Background Component
const ParticleBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-green-400/20"
          initial={{
            x: Math.random() * 100,
            y: Math.random() * 100,
            width: Math.random() * 300 + 100,
            height: Math.random() * 300 + 100,
            opacity: 0.1
          }}
          animate={{
            x: [null, Math.random() * 100 - 50],
            y: [null, Math.random() * 100 - 50],
            transition: {
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: "reverse"
            }
          }}
        />
      ))}
    </div>
  )
}

// Modern Hero Section with 3D tilt effect
const HeroSection = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const containerRef = useRef(null);

  const images = [
    '/images/home/image1.jpeg',
    '/images/home/image2.jpeg',
    '/images/home/image3.jpeg',
    '/images/home/image4.jpeg',
    '/images/home/image5.jpeg',
    '/images/home/image6.jpeg',
    '/images/home/image7.jpeg',
    '/images/home/image8.jpeg',
    '/images/home/image9.jpeg',
    '/images/home/image10.jpeg',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section className="relative min-h-screen pt-24 overflow-hidden bg-gradient-to-b from-green-50 to-white">
      <ParticleBackground />
      
      {/* Floating decorative elements */}
      <motion.div 
        className="absolute w-64 h-64 rounded-full top-1/4 left-10 bg-green-400/10 blur-3xl -z-10"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.15, 0.1]
        }}
        transition={{
          duration: 10,
          repeat: Infinity
        }}
      />
      
      <motion.div 
        className="absolute rounded-full bottom-1/4 right-10 w-80 h-80 bg-emerald-400/10 blur-3xl -z-10"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          delay: 2
        }}
      />

      <div className="container flex items-center h-full px-4 mx-auto">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <FadeInSection>
            <div className="space-y-8">
              <motion.h1 
                className="text-5xl font-bold leading-tight text-gray-900 md:text-6xl lg:text-7xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Transforming <motion.span 
                  className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%']
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >Agriwaste</motion.span> into Value
              </motion.h1>
              
              <motion.p 
                className="text-xl text-gray-700 md:max-w-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Join our marketplace to buy, sell, and recycle agricultural waste products, creating a circular economy
                that benefits farmers, businesses, and our planet.
              </motion.p>
              
              <motion.div 
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Button 
                  size="lg" 
                  className="group bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  onClick={() => navigate('/organic-waste')}
                >
                  Explore Marketplace
                  <ArrowRight />
                </Button>
              </motion.div>
            </div>
          </FadeInSection>
          
          <FadeInSection delay={0.2}>
            <motion.div 
              className="relative h-[500px] w-full rounded-3xl"
              ref={containerRef}
              whileHover="hover"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImageIndex}
                  className="absolute inset-0 w-full h-full overflow-hidden shadow-2xl rounded-3xl"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                >
                  <img
                    src={images[currentImageIndex]}
                    alt="Agriwaste transformation"
                    className="object-cover w-full h-full"
                  />
                </motion.div>
              </AnimatePresence>
              
              {/* Floating indicators */}
              <div className="absolute flex space-x-2 -translate-x-1/2 bottom-8 left-1/2">
                {images.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentImageIndex ? 
                      'w-8 bg-gradient-to-r from-green-500 to-emerald-500' : 
                      'w-2 bg-white/50'
                    }`}
                    whileHover={{ scale: 1.2 }}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
              
              {/* Floating tag */}
              <motion.div 
                className="absolute px-4 py-2 rounded-full shadow-md top-6 right-6 bg-white/90 backdrop-blur-sm"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <span className="font-medium text-green-600">Sustainable Solutions</span>
              </motion.div>
            </motion.div>
          </FadeInSection>
        </div>
      </div>
      
      {/* Animated scroll indicator */}
      <motion.div
        className="absolute -translate-x-1/2 bottom-8 left-1/2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <div className="flex flex-col items-center">
          <ChevronDown />
          <span className="mt-2 text-sm text-green-600">Scroll to explore</span>
        </div>
      </motion.div>
    </section>
  );
};

// Modern Features Section with floating cards
const FeaturesSection = () => {
  const features = [
    {
      icon: <Recycle className="w-10 h-10 text-green-500 drop-shadow-lg" />,
      title: "Sustainable Recycling",
      description: "Transform agricultural waste into valuable resources through our innovative recycling processes.",
    },
    {
      icon: <ShoppingBag className="w-10 h-10 text-yellow-500 drop-shadow-lg" />,
      title: "Marketplace",
      description: "Buy and sell agriwaste products in our secure and transparent digital marketplace.",
    },
    {
      icon: <Leaf className="w-10 h-10 text-lime-500 drop-shadow-lg" />,
      title: "Eco-Friendly Solutions",
      description: "Reduce environmental impact while creating economic opportunities for farmers and businesses.",
    },
    {
      icon: <TrendingUp className="w-10 h-10 text-blue-500 drop-shadow-lg" />,
      title: "Growth Opportunities",
      description: "Expand your business with sustainable practices and access to new markets.",
    },
  ]

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-br from-green-100 via-lime-50 to-emerald-100">
      <div className="absolute top-0 left-0 bg-green-200 rounded-full w-72 h-72 opacity-30 blur-3xl animate-pulse -z-10" style={{filter:'blur(80px)', top:'-100px', left:'-100px'}}/>
      <div className="absolute bottom-0 right-0 rounded-full w-96 h-96 bg-emerald-200 opacity-20 blur-3xl animate-pulse -z-10" style={{filter:'blur(120px)', bottom:'-120px', right:'-120px'}}/>
      <div className="container px-4 mx-auto">
        <FadeInSection>
          <div className="text-center">
            <h2 className="mb-2 text-4xl font-extrabold tracking-tight text-green-900 md:text-5xl drop-shadow-xl">Why Choose Our Platform?</h2>
            <p className="max-w-2xl mx-auto mt-4 text-lg font-medium text-green-700">
              Transforming agri-waste into opportunity: innovation, sustainability, and growth for all stakeholders.
            </p>
          </div>
        </FadeInSection>
        <div className="grid gap-10 mt-16 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <FadeInSection key={index} delay={index * 0.12}>
              <Card className="h-full transition-all duration-300 border-0 shadow-xl hover:shadow-2xl hover:scale-105 bg-gradient-to-br from-white via-green-50 to-lime-50 group">
                <CardContent className="flex flex-col items-center h-full p-8 text-center">
                  <motion.div whileHover={{ scale: 1.15, rotate: 8 }} className="p-6 mb-6 rounded-full shadow-inner bg-gradient-to-tr from-green-100 via-white to-lime-100 group-hover:shadow-lg">
                    {feature.icon}
                  </motion.div>
                  <h3 className="mb-2 text-2xl font-bold text-green-900 transition-colors drop-shadow-sm group-hover:text-emerald-700">{feature.title}</h3>
                  <p className="text-base font-medium text-green-700 transition-colors group-hover:text-green-900">{feature.description}</p>
                </CardContent>
              </Card>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  )
}

// Enhanced Main Section with parallax effect
const EnhancedMainSection = () => {
  return (
    <section className="relative overflow-hidden py-28 bg-gradient-to-br from-white to-green-50">
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 left-0 rounded-full w-96 h-96 bg-green-200/20 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 rounded-full w-96 h-96 bg-emerald-200/20 blur-3xl"></div>
      </div>
      
      <div className="container px-5 mx-auto">
        <div className="flex flex-wrap items-center -mx-4">
          <div className="w-full px-4 lg:w-1/2 xl:w-5/12">
            <FadeInSection>
              <div className="mt-10 lg:mt-0">
                <motion.span 
                  className="inline-block mb-4 text-lg font-semibold text-green-600"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Join the Movement
                </motion.span>
                <motion.h2 
                  className="mb-8 text-4xl font-bold text-gray-900 sm:text-5xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Creating a Sustainable Future Through Agriwaste Innovation
                </motion.h2>
                <motion.p 
                  className="mb-8 text-lg text-gray-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  Our platform connects farmers, recyclers, and businesses to create a circular economy for agricultural waste.Whether you're looking to
                  sell agricultural buy products or source sustainable materials, our platform makes it simple and
                  efficient.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <Button 
                    size="lg" 
                    variant="outline"
                    // eslint-disable-next-line no-undef
                    onClick={() => navigate('/about-us')}
                  >
                    Learn About Our Mission
                  </Button>
                </motion.div>
              </div>
            </FadeInSection>
          </div>
          
          <div className="w-full px-4 lg:w-1/2 xl:w-7/12">
            <div className="flex items-center -mx-3 sm:-mx-4">
              <div className="w-full px-3 sm:px-4 xl:w-1/2">
                <FadeInSection delay={0.1}>
                  <motion.div 
                    className="py-3 sm:py-4"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="relative h-64 overflow-hidden shadow-xl rounded-3xl">
                      <img
                        src='/images/home/sustainable1.jpeg'
                        alt="Agricultural waste recycling"
                        className="absolute inset-0 object-cover w-full h-full transition-transform duration-700 hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 p-6 text-white">
                      </div>
                    </div>
                  </motion.div>
                </FadeInSection>
                
                <FadeInSection delay={0.2}>
                  <motion.div 
                    className="py-3 sm:py-4"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="relative h-64 overflow-hidden shadow-xl rounded-3xl">
                      <img
                        src='/images/home/sustainable2.jpeg'
                        alt="Sustainable farming"
                        className="absolute inset-0 object-cover w-full h-full transition-transform duration-700 hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 p-6 text-white">
                      </div>
                    </div>
                  </motion.div>
                </FadeInSection>
              </div>
              
              <div className="w-full px-3 sm:px-4 xl:w-1/2">
                <FadeInSection delay={0.3}>
                  <motion.div 
                    className="relative z-10 my-4"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="relative overflow-hidden rounded-3xl shadow-2xl h-[560px]">
                      <img
                        src='/images/home/sustainable3.jpeg'
                        alt="Agriwaste products"
                        className="absolute inset-0 object-cover w-full h-full transition-transform duration-700 hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 p-6 text-white">
                      </div>
                    </div>
                  </motion.div>
                </FadeInSection>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Modern How It Works Section with animated timeline
const HowItWorksSection = () => {
  const steps = [
    {
      number: "01",
      title: "Register & Connect",
      description: "Create your account and connect with farmers, recyclers, and businesses in your area.",
    },
    {
      number: "02",
      title: "List or Browse Products",
      description: "List your agriwaste products or browse available materials in our marketplace.",
    },
    {
      number: "03",
      title: "Secure Transactions",
      description: "Complete secure transactions with our integrated payment and verification system.",
    },
    {
      number: "04",
      title: "Sustainable Impact",
      description: "Track your environmental impact and contribute to a circular economy.",
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container px-4 mx-auto">
        <FadeInSection>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">How It Works</h2>
            <p className="max-w-2xl mx-auto mt-4 text-lg text-gray-600">
              Our simple four-step process makes recycling and trading agriwaste easy and efficient
            </p>
          </div>
        </FadeInSection>

        <div className="relative mt-20">
          

          <div className="grid gap-10 md:grid-cols-4">
            {steps.map((step, index) => (
              <FadeInSection key={index} delay={index * 0.1}>
                <div className="relative flex flex-col items-center">
                  <motion.div
                    className="z-10 flex items-center justify-center w-16 h-16 text-xl font-bold text-white bg-green-600 rounded-full"
                    whileHover={{ scale: 1.1 }}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {step.number}
                  </motion.div>
                  <h3 className="mt-6 text-xl font-semibold text-gray-900">{step.title}</h3>
                  <p className="mt-2 text-center text-gray-600">{step.description}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// Modern Marketplace Preview with 3D card effect
const MarketplacePreview = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRandomProducts = async () => {
      try {
        setLoading(true);
        const response = await apiService.get("/api/product-listing/random-approved-listings");

        const formattedProducts = response.data.map(product => ({
          ...product,
          title: product.wasteItem,
          category: product.wasteType,
          price: product.price,
          image: product.image
        }));

        setProducts(formattedProducts);
      } catch (error) {
        console.error("Error fetching random products:", error);
        setError("Failed to load featured products");
      } finally {
        setLoading(false);
      }
    };

    fetchRandomProducts();
  }, []);

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-br from-green-50 to-white">
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 right-0 rounded-full w-96 h-96 bg-green-200/20 blur-3xl"></div>
      </div>

      <div className="container px-4 mx-auto">
        <FadeInSection>
          <div className="mb-20 text-center">
            <h2 className="mb-6 text-4xl font-extrabold text-gray-900 md:text-5xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                Featured Products
              </span>
            </h2>
            <p className="max-w-2xl mx-auto text-xl text-gray-600">
              Discover sustainable agriwaste products transforming the circular economy
            </p>
          </div>
        </FadeInSection>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-12 h-12 border-t-2 border-b-2 border-green-600 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="py-8 font-semibold text-center text-red-500">{error}</div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product, index) => (
              <FadeInSection key={product._id || index} delay={index * 0.1}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="group relative overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-150 hover:shadow-xl border border-gray-100 h-[420px]"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 transition-opacity duration-200 opacity-0 bg-gradient-to-t from-black/40 via-transparent to-transparent group-hover:opacity-100"></div>
                    <div className="absolute px-3 py-1 text-xs font-medium text-white rounded-full shadow-md top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600">
                      {product.category}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-2 min-h-[3.5rem] mb-3">
                      {product.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-green-600">
                        Rs. {product.price}.00
                      </span>
                    </div>
                  </div>
                  <div className="absolute inset-0 transition-all duration-300 border-2 border-transparent pointer-events-none group-hover:border-green-400/30 rounded-3xl"></div>
                </motion.div>
              </FadeInSection>
            ))}
          </div>
        )}

        <FadeInSection delay={0.4}>
          <div className="mt-16 text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/organic-waste')}
              className="relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-medium text-white transition-all duration-300 rounded-full shadow-lg bg-gradient-to-r from-green-600 to-emerald-500 group hover:shadow-green-400/30"
            >
              <span className="absolute top-0 right-0 inline-block w-4 h-4 transition-all duration-500 bg-white rounded-full opacity-10 group-hover:w-56 group-hover:h-56"></span>
              <span className="relative flex items-center gap-2">
                Explore Marketplace <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </span>
            </motion.button>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
};

// Modern Testimonials Section with animated cards
const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        const res = await apiService.get("/api/reviews/random-top-reviews");
        setTestimonials(res.data);
      } catch (error) {
      console.error(error);
        setError("Failed to load testimonials");
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  return (
    <section className="py-20 bg-gradient-to-b from-white to-green-50">
      <div className="container px-4 mx-auto">
        <FadeInSection>
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-400">
                What Our Users Say
              </span>
            </h2>
            <p className="max-w-2xl mx-auto mt-4 text-xl text-gray-600">
              Hear from farmers, businesses, and recyclers who are already making a difference
            </p>
          </div>
        </FadeInSection>
        
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-12 h-12 border-t-2 border-b-2 border-green-600 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="py-8 font-semibold text-center text-red-500">{error}</div>
        ) : (
          <div className="grid gap-8 mt-8 md:grid-cols-3">
            {testimonials.map((review, index) => (
              <FadeInSection key={review._id || index} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="flex flex-col h-full p-6 transition-all duration-300 bg-white border border-gray-100 shadow-lg rounded-xl hover:shadow-xl"
                >
                  {/* Product Name Highlight */}
                  <div className="mb-6">
                    <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider text-green-800 uppercase bg-green-100 rounded-full">
                      {review.productName || "Our Product"}
                    </span>
                  </div>
                  
                  {/* Review Content */}
                  <div className="relative flex-1 mb-8">
                    <svg
                      className="absolute w-12 h-12 text-green-100 -top-4 -left-4 opacity-70"
                      fill="currentColor"
                      viewBox="0 0 32 32"
                    >
                      <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                    </svg>
                    <p className="relative z-10 pl-6 text-lg italic text-gray-700">
                      "{review.review}"
                    </p>
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={
                        i < review.rating
                          ? "text-yellow-400 text-2xl"
                          : "text-gray-200 text-2xl"
                      }>
                        ★
                      </span>
                    ))}
                    <span className="ml-2 text-sm font-medium text-gray-500">
                      {review.rating}/5
                    </span>
                  </div>
                  
                  {/* Buyer Info */}
                  <div className="flex items-center pt-4 border-t border-gray-100">
                    <div className="relative flex items-center justify-center overflow-hidden rounded-full h-14 w-14 bg-gradient-to-br from-green-400 to-green-600">
                      <span className="text-xl font-bold text-white">
                        {review.buyer?.name?.charAt(0) || "U"}
                      </span>
                      <div className="absolute inset-0 border-2 rounded-full border-white/30">
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-gray-900">{review.buyer?.name || "User"}</h4>
                      <p className="text-sm text-gray-500">Verified Buyer</p>
                    </div>
                  </div>
                </motion.div>
              </FadeInSection>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// Modern CTA Section with animated gradient
export const CtaSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 text-white bg-gradient-to-r from-green-500 via-green-450 to-green-500">
      <div className="container px-6 mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <FadeInSection>
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
              Ready to Join the Agriwaste Revolution?
            </h2>
            <p className="mt-4 text-lg text-slate-100 md:text-xl">
              Start buying, selling, and recycling agricultural waste today and lead the way toward a greener tomorrow.
            </p>
            <div className="flex justify-center mt-8">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  variant="ghost"
                  className="transition-colors bg-white text-lime-700 hover:bg-lime-100"
                  onClick={() => navigate('/register')}
                >
                  Sign Up Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </div>
          </FadeInSection>
        </div>
      </div>
    </section>
  );
};

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-hidden bg-white">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <EnhancedMainSection />
      <HowItWorksSection />
      <MarketplacePreview />
      <TestimonialsSection />
      <CtaSection />
      <Footer />
    </div>
  )
}