/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { FaStar } from "react-icons/fa";

const Testimonials = () => {
  return (
    <div className="section-container">
      <div className="flex flex-col md:flex-row items-center justify-between gap-24 ml-20 ">
        <div className="md:w-1/2">
          <img src="/termino.png" alt="" />
        </div>
        <div className="md:w-1/2 mt-24">
          <div className="text-left md:w-4/5 mt-8"> {/* Added mt-8 for margin-top */}
            <p className="subtitle text-5xl text-purple my-5">Testimonials</p>
            <h2 className="title text-3xl">What Our Customers Say About Us</h2>
            <blockquote className="my-5 text-black text-xl leading-[30px]">
              “I recently rented a bike from this website, and I
               couldn’t be happier with the experience!
                 The bike was in excellent condition, and the team’s
                  attention to detail, from the easy booking system to
                   the clear instructions provided, was truly impressive.I highly recommend
                     this website to anyone looking for a reliable and enjoyable
                      bike rental service.”
            </blockquote>
           
           {/* avater */}

           <div className="flex items-center gap-4 flex-wrap">
           <div className="avatar-group -space-x-6 rtl:space-x-reverse">
              <div className="avatar">
                <div className="w-12 cursor-pointer">
                  <img src="/1.jpeg" />
                </div>
              </div>
              <div className="avatar">
                <div className="w-12 cursor-pointer">
                  <img src="/2.jpg" />
                </div>
              </div>
              <div className="avatar">
                <div className="w-12 cursor-pointer">
                  <img src="/3.jpg" />
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <h5 className="text-lg font-semibold">Customer Feedback</h5>
              <div className="flex items-center gap-2"><FaStar className="text-purple"/> <span className="font-medium">4.9</span> <span className="text-[#807E7E]">(18.6M Reviews)</span></div>
            </div>
           </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;