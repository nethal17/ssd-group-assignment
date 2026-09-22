import React from "react";
import { Navbar } from "../components/Navbar";

export const ContactUs = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen px-6 py-12 bg-gradient-to-br from-green-50 to-emerald-50">
        <section className="max-w-6xl mx-auto">
          <div className="overflow-hidden bg-white shadow-xl rounded-2xl">
            <div className="grid gap-0 lg:grid-cols-2">
              {/* Left Side - Contact Form */}
              <div className="p-8 bg-white md:p-12 lg:p-16">
                <h2 className="mb-6 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
                  Contact our team
                </h2>
                
                <p className="mb-8 text-gray-600">
                  Have questions? Fill out the form below and we'll get back to you as soon as possible.
                </p>

                <form className="space-y-6">
                  <div className="relative">
                    <input
                      type="text"
                      className="block w-full px-4 py-3 text-gray-700 transition-all duration-200 border border-gray-200 rounded-lg peer bg-gray-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      id="exampleInput7"
                      placeholder=" "
                    />
                    <label 
                      htmlFor="exampleInput7"
                      className="absolute left-4 -top-2.5 px-1 bg-white text-gray-600 text-sm transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-emerald-600"
                    >
                      Your Name
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      type="email"
                      className="block w-full px-4 py-3 text-gray-700 transition-all duration-200 border border-gray-200 rounded-lg peer bg-gray-50 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      id="exampleInput8"
                      placeholder=" "
                    />
                    <label 
                      htmlFor="exampleInput8"
                      className="absolute left-4 -top-2.5 px-1 bg-white text-gray-600 text-sm transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-emerald-600"
                    >
                      Email Address
                    </label>
                  </div>

                  <div className="relative">
                    <textarea
                      className="peer block w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 min-h-[120px]"
                      id="exampleFormControlTextarea13"
                      rows="3"
                      placeholder=" "
                    ></textarea>
                    <label 
                      htmlFor="exampleFormControlTextarea13"
                      className="absolute left-4 -top-2.5 px-1 bg-white text-gray-600 text-sm transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-emerald-600"
                    >
                      Your Message
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full px-6 py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-50 transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    Send Message
                  </button>
                </form>
              </div>

              {/* Right Side - FAQ */}
              <div className="p-8 md:p-12 lg:p-16 bg-gradient-to-br from-green-100 to-emerald-100">
                <div className="space-y-8">
                  <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
                    Frequently asked questions
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="p-5 transition-shadow duration-300 shadow-sm bg-white/80 backdrop-blur-sm rounded-xl hover:shadow-md">
                      <p className="mb-2 font-bold text-emerald-700">Anim pariatur cliche reprehenderit?</p>
                      <p className="text-gray-600">
                        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sunt
                        autem numquam dolore molestias aperiam culpa alias veritatis
                        architecto eos.
                      </p>
                    </div>

                    <div className="p-5 transition-shadow duration-300 shadow-sm bg-white/80 backdrop-blur-sm rounded-xl hover:shadow-md">
                      <p className="mb-2 font-bold text-emerald-700">Non cupidatat skateboard dolor brunch?</p>
                      <p className="text-gray-600">
                        Distinctio corporis, iure facere ducimus quos consectetur ipsa ut
                        magnam autem doloremque ex! Id, sequi. Voluptatum magnam sed fugit
                        iusto minus et suscipit?
                      </p>
                    </div>

                    <div className="p-5 transition-shadow duration-300 shadow-sm bg-white/80 backdrop-blur-sm rounded-xl hover:shadow-md">
                      <p className="mb-2 font-bold text-emerald-700">Praesentium voluptatibus temporibus consequatur?</p>
                      <p className="text-gray-600">
                        Minima sunt at nulla tenetur, numquam unde quod modi magnam ab
                        deserunt ipsam sint aliquid dolores libero repellendus cupiditate
                        mollitia quidem dolorem.
                      </p>
                    </div>

                    <div className="p-5 transition-shadow duration-300 shadow-sm bg-white/80 backdrop-blur-sm rounded-xl hover:shadow-md">
                      <p className="mb-2 font-bold text-emerald-700">Voluptatum magnam sed fugit iusto minus?</p>
                      <p className="text-gray-600">
                        Laudantium perferendis, est alias iure ut veniam suscipit dolorem
                        fugit. Et ipsam corporis earum ea ut quae cum non iusto blanditiis
                        ipsum dolor eius reiciendis.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};