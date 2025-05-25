
import React from "react";

const AboutUs = () => {
  return (
    <div className="bg-white text-gray-800 py-12 px-4 md:px-20">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center text-purple">
          About RentifyHub
        </h1>

        <p className="text-lg mb-8 text-center max-w-3xl mx-auto">
          Welcome to <strong>RentifyHub.com</strong> – your trusted online rental marketplace. Whether you’re looking to rent a room, a car, or electronic gadgets, or lend out your own items, we make it simple, secure, and smart.
        </p>

        <div className="grid md:grid-cols-2 gap-10 mb-12">
          <div>
            <h2 className="text-2xl font-semibold text-yellow mb-3">What We Offer</h2>
            <ul className="list-disc ml-6 space-y-2 text-base">
              <li>Verified listings for homes, vehicles, gadgets, and more</li>
              <li>Real-time chat between renters and lenders</li>
              <li>Chatbot for instant assistance</li>
              <li>Secure payments via eSewa</li>
              <li>Easy-to-use booking calendar</li>
              <li>Transparent ratings and reviews</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-yellow mb-3">Why RentifyHub?</h2>
            <ul className="list-disc ml-6 space-y-2 text-base">
              <li>All-in-one platform for both renting and lending</li>
              <li>Admin verification for quality and safety</li>
              <li>User-friendly interface built with modern tech</li>
              <li>Built for flexibility with no role switching needed</li>
              <li>Fast, reliable, and accessible from any device</li>
            </ul>
          </div>
        </div>

        <div className="bg-gray-100 p-6 rounded-lg shadow-md text-center">
          <h3 className="text-2xl font-bold mb-3">Our Vision</h3>
          <p className="text-base max-w-2xl mx-auto">
            We envision a connected world where people can rent or lend anything they own with confidence. RentifyHub is here to build a smarter, more sustainable rental economy by reducing waste and making resources more accessible to everyone.
          </p>
        </div>

        <div className="mt-12 text-center">
          <p className="text-base">
            📩 Have questions or feedback? Contact us at{" "}
            <a href="mailto:support@rentifyhub.com" className="text-blue-600 underline">
              support@rentifyhub.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
