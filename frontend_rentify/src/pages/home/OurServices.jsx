import React from "react";

const serviceLists = [
  {
    id: 1,
    title: "Verified Listings",
    des: "All rentals are verified by our team to ensure safety and trust.",
    img: "/rentall.png",
  },
  {
    id: 2,
    title: "Real-Time Chat",
    des: "Talk directly with owners or renters using our instant chat system.",
    img: "/chat.png",
  },
  {
    id: 3,
    title: "Secure Payments",
    des: "Enjoy worry-free transactions through trusted gateways like eSewa.",
    img: "/pay.png",
  },
  {
    id: 4,
    title: "Location Based Items",
    des: "Get personalized rental items according to the location map.",
    img: "/location.png",
  },
];

const OurServices = () => {
  return (
    <div className="section-container">
      <div className="flex flex-col md:flex-row items-center justify-between gap-24 ml-20">
        
        {/* TEXT SECTION FIRST */}
        <div className="md:w-1/2 mt-24 order-2 md:order-1">
          <div className="text-left md:w-4/5 mt-8">
            <p className="subtitle text-5xl text-purple my-5">Our Services</p>
            <h2 className="title text-3xl">Why RentifyHub is Your Trusted Rental Partner</h2>
            <p className="my-5 text-black text-xl leading-[30px]">
              From apartments to appliances, RentifyHub makes renting safe, smart, and simple. 
              With verified listings, secure payments, and instant communication, we're redefining rentals in Nepal.
            </p>

            {/* Services Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10">
              {serviceLists.map((service) => (
                <div
                  key={service.id}
                  className="shadow-md bg-white rounded-md py-6 px-4 text-center space-y-2 cursor-pointer hover:border hover:border-purple transition-all duration-300"
                >
                  <img
                    src={service.img}
                    alt={service.title}
                    className="mx-auto max-w-[100px]"
                  />
                  <h5 className="pt-3 font-semibold text-lg text-purple">
                    {service.title}
                  </h5>
                  <p className="text-[#555] text-base">{service.des}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* IMAGE SECTION SECOND */}
        <div className="md:w-1/2 order-1 md:order-2 mr-20">
          <img src="/service.png" alt="Rentify Services" className="rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export default OurServices;
