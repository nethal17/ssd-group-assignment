import { useRef } from "react"
import { useAnimation, useInView } from "framer-motion"
import { useNavigate } from "react-router-dom"; 
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { apiService } from "../utils/api";
import { useState, useEffect } from "react";


// Custom Button component
const Button = ({ children, className = "", variant = "default", size = "default", ...props }) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"

  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
  }

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  }

  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  )
}

// Custom Card components
const Card = ({ className = "", ...props }) => {
  return <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`} {...props} />
}

const CardContent = ({ className = "", ...props }) => {
  return <div className={`p-6 pt-0 ${className}`} {...props} />
}

// Icons (simplified versions)
const ArrowRight = () => (
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
    className="ml-2 h-4 w-4"
  >
    <path d="M5 12h14"></path>
    <path d="m12 5 7 7-7 7"></path>
  </svg>
)

const ChevronDown = () => (
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
    className="h-8 w-8 text-green-600"
  >
    <path d="m6 9 6 6 6-6"></path>
  </svg>
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
    className="h-10 w-10 text-green-600"
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
    className="h-10 w-10 text-green-600"
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
    className="h-10 w-10 text-green-600"
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
    className="h-10 w-10 text-green-600"
  >
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
    <polyline points="16 7 22 7 22 13"></polyline>
  </svg>
)

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
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const HeroSection = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
    }, 2000); 

    return () => clearInterval(interval);
  }, [images.length]); 

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-green-50 to-white pt-20 md:pt-0">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <FadeInSection>
            <div className="space-y-6">
              <h1 className="text-4xl font-bold leading-tight text-green-900 md:text-5xl lg:text-6xl">
                Transforming <span className="text-green-600">Agriwaste</span> into Sustainable Value
              </h1>
              <p className="text-lg text-gray-700 md:max-w-lg">
                Join our marketplace to buy, sell, and recycle agricultural waste products, creating a circular economy
                that benefits farmers, businesses, and our planet.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  className="bg-green-600 hover:bg-green-700 group transition-all"
                  onClick={() => navigate('/organic-waste')}
                >
                  Explore Marketplace
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </FadeInSection>
          <FadeInSection delay={0.2} className="relative h-[400px] md:h-[500px]">
            {/* Image Carousel */}
            <div className="relative h-full w-full overflow-hidden rounded-2xl shadow-2xl">
              {images.map((image, index) => (
                <motion.div
                  key={image}
                  className="absolute inset-0 h-full w-full"
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: index === currentImageIndex ? 1 : 0,
                    scale: index === currentImageIndex ? 1 : 1.05
                  }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                >
                  <img
                    src={image}
                    alt="Agriwaste recycling illustration"
                    className="h-full w-full object-cover"
                  />
                </motion.div>
              ))}
              
              {/* Image Indicators */}
              <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-2 w-2 rounded-full transition-all ${index === currentImageIndex ? 'w-6 bg-green-600' : 'bg-white/50'}`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-green-500/10"></div>
            <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-green-500/10"></div>
          </FadeInSection>
        </div>

        {/* Animated Scroll Indicator */}
        <motion.div
          className="absolute bottom-4 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="h-8 w-8 text-green-600" />
        </motion.div>
      </div>
    </section>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: <Recycle className="text-green-500 w-10 h-10 drop-shadow-lg" />,
      title: "Sustainable Recycling",
      description: "Transform agricultural waste into valuable resources through our innovative recycling processes.",
    },
    {
      icon: <ShoppingBag className="text-yellow-500 w-10 h-10 drop-shadow-lg" />,
      title: "Marketplace",
      description: "Buy and sell agriwaste products in our secure and transparent digital marketplace.",
    },
    {
      icon: <Leaf className="text-lime-500 w-10 h-10 drop-shadow-lg" />,
      title: "Eco-Friendly Solutions",
      description: "Reduce environmental impact while creating economic opportunities for farmers and businesses.",
    },
    {
      icon: <TrendingUp className="text-blue-500 w-10 h-10 drop-shadow-lg" />,
      title: "Growth Opportunities",
      description: "Expand your business with sustainable practices and access to new markets.",
    },
  ]

  return (
    <section className="relative py-20 bg-gradient-to-br from-green-100 via-lime-50 to-emerald-100 overflow-hidden">
      <div className="absolute top-0 left-0 w-72 h-72 bg-green-200 rounded-full opacity-30 blur-3xl animate-pulse -z-10" style={{filter:'blur(80px)', top:'-100px', left:'-100px'}}/>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-200 rounded-full opacity-20 blur-3xl animate-pulse -z-10" style={{filter:'blur(120px)', bottom:'-120px', right:'-120px'}}/>
      <div className="container mx-auto px-4">
        <FadeInSection>
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold text-green-900 tracking-tight drop-shadow-xl mb-2">Why Choose Our Platform?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-green-700 font-medium">
              Transforming agri-waste into opportunity: innovation, sustainability, and growth for all stakeholders.
            </p>
          </div>
        </FadeInSection>
        <div className="mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <FadeInSection key={index} delay={index * 0.12}>
              <Card className="h-full border-0 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 bg-gradient-to-br from-white via-green-50 to-lime-50 group">
                <CardContent className="flex h-full flex-col items-center p-8 text-center">
                  <motion.div whileHover={{ scale: 1.15, rotate: 8 }} className="mb-6 rounded-full bg-gradient-to-tr from-green-100 via-white to-lime-100 p-6 shadow-inner group-hover:shadow-lg">
                    {feature.icon}
                  </motion.div>
                  <h3 className="mb-2 text-2xl font-bold text-green-900 drop-shadow-sm group-hover:text-emerald-700 transition-colors">{feature.title}</h3>
                  <p className="text-green-700 group-hover:text-green-900 transition-colors text-base font-medium">{feature.description}</p>
                </CardContent>
              </Card>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  )
}

const EnhancedMainSection = () => {
  return (
    <section className="bg-gradient-to-br from-white to-green-50 py-20">
      <div className="container mx-auto px-5 lg:px-36">
        <div className="flex flex-wrap items-center justify-between -mx-4">
          <div className="w-full px-4 lg:w-1/2 xl:w-5/12">
            <FadeInSection>
              <div className="mt-10 lg:mt-0">
                <span className="block mb-2 text-lg font-semibold text-green-600">Join with us</span>
                <h2 className="mb-8 text-3xl font-bold text-zinc-900 sm:text-4xl">
                  Creating a Sustainable Future Through Agriwaste Innovation
                </h2>
                <p className="mb-8 text-base text-gray-600">
                  Our platform connects farmers, recyclers, and businesses to create a circular economy for agricultural
                  waste. By transforming waste into valuable resources, we're building a more sustainable future for
                  agriculture.
                </p>
                <p className="mb-12 text-base text-zinc-900">
                  Join thousands of users already making a difference through our marketplace. Whether you're looking to
                  sell agricultural buy products or source sustainable materials, our platform makes it simple and
                  efficient.
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                </motion.div>
              </div>
            </FadeInSection>
          </div>
          <div className="w-full lg:w-6/12">
            <div className="flex items-center -mx-3 sm:-mx-4">
              <div className="w-full px-3 sm:px-4 xl:w-1/2">
                <FadeInSection delay={0.1}>
                  <div className="py-3 sm:py-4">
                    <motion.div whileHover={{ scale: 1.05 }} className="overflow-hidden rounded-2xl">
                      <img
                        src='/images/home/sustainable1.jpeg' 
                        alt="Agricultural waste recycling"
                        className="w-full rounded-2xl transition-transform duration-500 hover:scale-110"
                      />
                    </motion.div>
                  </div>
                </FadeInSection>
                <FadeInSection delay={0.2}>
                  <div className="py-3 sm:py-4">
                    <motion.div whileHover={{ scale: 1.05 }} className="overflow-hidden rounded-2xl">
                      <img
                        src='/images/home/sustainable2.jpeg' 
                        alt="Sustainable farming practices"
                        className="w-full rounded-2xl transition-transform duration-500 hover:scale-110"
                      />
                    </motion.div>
                  </div>
                </FadeInSection>
              </div>
              <div className="w-full px-3 sm:px-4 xl:w-1/2">
                <FadeInSection delay={0.3}>
                  <div className="relative z-10 my-4">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="overflow-hidden rounded-2xl shadow-[0_20px_50px_rgba(8,_112,_84,_0.2)]"
                    >
                      <img
                        src='/images/home/sustainable3.jpeg' 
                        alt="Agriwaste products"
                        className="w-full rounded-2xl transition-transform duration-500 hover:scale-110"
                      />
                    </motion.div>
                  </div>
                </FadeInSection>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

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
    <section className="bg-white py-20">
      <div className="container mx-auto px-4">
        <FadeInSection>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">How It Works</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
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
                    className="z-10 flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-xl font-bold text-white"
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
    <section className="bg-gradient-to-br from-green-50 to-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <FadeInSection>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 md:text-5xl mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-500">
                Featured Products
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Discover sustainable agriwaste products transforming the circular economy
            </p>
          </div>
        </FadeInSection>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 font-semibold py-8">{error}</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product, index) => (
              <FadeInSection key={product._id || index} delay={index * 0.1}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="group relative overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-200 hover:shadow-xl border border-gray-100"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={product.image}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-4 right-4 rounded-full bg-green-600 px-3 py-1 text-xs font-medium text-white shadow-md">
                      {product.category}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">{product.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-green-600">
                        Rs. {product.price}.00
                      </span>
                    </div>
                  </div>
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-green-400/30 rounded-2xl pointer-events-none transition-all duration-300"></div>
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
              className="relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-medium text-white transition-all duration-300 bg-gradient-to-r from-green-600 to-emerald-500 rounded-full group shadow-lg hover:shadow-green-400/30"
            >
              <span className="absolute top-0 right-0 inline-block w-4 h-4 transition-all duration-500 rounded-full bg-white opacity-10 group-hover:w-56 group-hover:h-56"></span>
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
    <section className="bg-gradient-to-b from-white to-green-50 py-20">
      <div className="container mx-auto px-4">
        <FadeInSection>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 md:text-5xl mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-400">
                What Our Users Say
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-600">
              Hear from farmers, businesses, and recyclers who are already making a difference
            </p>
          </div>
        </FadeInSection>
        
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 font-semibold py-8">{error}</div>
        ) : (
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            {testimonials.map((review, index) => (
              <FadeInSection key={review._id || index} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="flex h-full flex-col rounded-xl bg-white p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
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
                      className="absolute -top-4 -left-4 h-12 w-12 text-green-100 opacity-70"
                      fill="currentColor"
                      viewBox="0 0 32 32"
                    >
                      <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                    </svg>
                    <p className="relative z-10 text-lg italic text-gray-700 pl-6">
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
                    <div className="relative h-14 w-14 overflow-hidden rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                      <span className="text-white font-bold text-xl">
                        {review.buyer?.name?.charAt(0) || "U"}
                      </span>
                      <div className="absolute inset-0 rounded-full border-2 border-white/30">
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

export const CtaSection = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-gradient-to-r from-green-500 via-green-450 to-green-500 py-20 text-white">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          <FadeInSection>
            <h2 className="text-4xl font-extrabold md:text-5xl leading-tight tracking-tight">
              Ready to Join the Agriwaste Revolution?
            </h2>
            <p className="mt-4 text-lg text-slate-100 md:text-xl">
              Start buying, selling, and recycling agricultural waste today and lead the way toward a greener tomorrow.
            </p>
            <div className="mt-8 flex justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  variant="ghost"
                  className="bg-white text-lime-700 hover:bg-lime-100 transition-colors"
                  onClick={() => navigate('/register')}
                >
                  Sign Up Now
                  <ArrowRight className="ml-2 w-5 h-5" />
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
    <div className="min-h-screen bg-white">
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
