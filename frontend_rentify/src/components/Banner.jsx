import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const images = [
  "/banner1.jpg",
  "/banner2.jpg",
  "/banner3.jpg",
  "/banner4.jpg",
  "/banner5.jpg",
  "/banner6.jpg"
];

const Banner = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2000); // Change image every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  return (
    <div className="max-w-screen-2xl container mx-auto xl:px-24 bg-gradient-to-r from-0% from-[#FAFAFA] to-[#FCFCFC] to-100% mt-24">
      <div className="flex flex-col md:flex-row-reverse items-center justify-between gap-4 md:gap-8 mt-15 pt-5">
        
        {/* Image Carousel */}
        <div className="md:w-1/2 relative overflow-hidden rounded-lg">
          <div
            className="flex transition-transform duration-1000 ease-in-out"
            style={{
              transform: `translateX(-${currentImageIndex * 100}%)`, // Move image horizontally
            }}
          >
            {images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Banner ${index + 1}`}
                className="w-full h-full object-cover" // Ensure the image covers the container and maintains aspect ratio
                style={{
                  flexShrink: 0, // Prevent shrinking of the images in the flex container
                  width: '100%', // Make sure images occupy full width of the container
                  height: '100%', // Make sure images occupy full height of the container
                }}
                loading="lazy" // Lazy load images for better performance
              />
            ))}
          </div>
        </div>

        {/* Texts */}
        <div className="md:w-1/2 px-4 space-y-5">
          <h2 className="md:text-5xl text-4xl font-bold md:leading-snug leading-snug">
           <span className="text-purple"> Your Perfect Rental, </span><span className="text-yellow">Just a Click Away!</span>
          </h2>
          <p className="text-[#4A4A4A] text-xl">
            Experience the convenience of renting everything you need, right at your doorstep. From electronics to furniture, we offer a wide range of high-quality products to match your lifestyle. Browse, select, and enjoy the flexibility of renting – all with unmatched ease and affordability. Whether it's short-term or long-term, find the perfect rental for every occasion.
          </p>
          <Link to="/rent">
            <button className="bg-purple text-white font-semibold px-8 py-3 rounded-full mt-6">
              Rent Now
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Banner;
