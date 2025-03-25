import React from "react";

const serviceLists = [
    {id:1, title: "Fresh Products", des: "Handpicked, fresh produce to elevate your meals.", img: "/our1.png"},
    {id:2, title: "Fast delivery", des: "Swift delivery to enjoy your favorites sooner.", img: "/our2.png"},
    {id:3, title: "Online Ordering", des: "Easy online ordering for hassle-free dining.", img: "/our3.png"},
    {id:4, title: "Gift Offers", des: "Give the gift of exceptional dining experiences.", img: "/our4.png"},
]; 

const OurServices = () => {
  return (
    <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-20 xl:px-40"> {/* Added container with responsive padding */}
      <div className="section-container my-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="md:w-1/2">
            <div className="text-left md:w-4/5 mt-[-50px]">
              <p className="subtitle">Our Story & Services</p>
              <h2 className="title">Discover Our Farmer&apos;s Market Experience</h2>
              <p className="my-5 text-secondary leading-[30px]">
                At Farmer&apos;s Market, we&apos;re passionate about connecting you with fresh, locally sourced produce. With exceptional service and a diverse selection, we aim to make every visit memorable. Join us on a journey of flavor and freshness!
              </p>
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
              {
                serviceLists.map((service) => (
                  <div key={service.id} className="shadow-md rounded-sm py-5 px-4 text-center space-y-2 text-green cursor-pointer hover:border hover:border-indigo-600 transition-all duration-200">
                    <img src={service.img} alt="" className="mx-auto max-w-[150px]" /> {/* Adjusted image size */}
                    <h5 className="pt-3 font-semibold"> {service.title}</h5>
                    <p className="text-[#555]">{service.des}</p>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurServices;
