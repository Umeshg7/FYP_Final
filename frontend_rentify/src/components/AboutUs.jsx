import React from 'react';
import { FaUsers, FaLightbulb, FaHandshake, FaChartLine } from 'react-icons/fa';
import { IoMdRocket } from 'react-icons/io';
import { GiEarthAmerica } from 'react-icons/gi';
import team1 from '../../public/baby.png';
import team2 from '../../public/baby.png';
import team3 from '../../public/baby.png';
import team4 from '../../public/baby.png';

const AboutUs = () => {
  return (
    <div className="font-sans text-gray-800">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-700 py-20 text-white">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-6">Our Story</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Empowering communities through innovative rental solutions that connect people with the items they need.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white transform skew-y-1 origin-top-left"></div>
      </section>

      {/* Our Mission */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
              <h2 className="text-3xl font-bold mb-6 text-gray-800">Our Mission</h2>
              <p className="text-lg mb-6 text-gray-600">
                To create a sustainable sharing economy where people can easily access what they need, when they need it, without the burden of ownership.
              </p>
              <p className="text-lg text-gray-600">
                We believe in reducing waste, saving money, and building community connections through our platform.
              </p>
            </div>
            <div className="md:w-1/2">
              <div className="bg-blue-50 rounded-xl p-8 shadow-lg">
                <div className="flex items-start mb-6">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <IoMdRocket className="text-blue-600 text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Our Vision</h3>
                    <p className="text-gray-600">
                      To become the world's most trusted rental marketplace, transforming how people access goods and services.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-purple-100 p-3 rounded-full mr-4">
                    <GiEarthAmerica className="text-purple-600 text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Global Impact</h3>
                    <p className="text-gray-600">
                      We're committed to reducing global consumption and promoting sustainable living through sharing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Journey</h2>
          <div className="relative">
            {/* Timeline */}
            <div className="border-l-2 border-blue-500 absolute h-full left-1/2 transform -translate-x-1/2"></div>
            
            {/* Timeline Items */}
            <div className="mb-12">
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 md:pr-10 md:text-right mb-4 md:mb-0">
                  <h3 className="text-xl font-semibold">2018 - The Beginning</h3>
                  <p className="text-gray-600">Founded in a college dorm room with just 5 rental listings</p>
                </div>
                <div className="md:w-1/2 md:pl-10">
                  <div className="bg-white p-6 rounded-lg shadow-md relative">
                    <div className="absolute w-4 h-4 bg-blue-500 rounded-full -left-2 transform -translate-x-1/2 top-6"></div>
                    <p>Our founders noticed how many items sat unused while others needed temporary access to those same items.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-12">
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 md:pr-10 md:text-right mb-4 md:mb-0 order-2 md:order-1">
                  <div className="bg-white p-6 rounded-lg shadow-md relative">
                    <div className="absolute w-4 h-4 bg-blue-500 rounded-full -right-2 transform translate-x-1/2 top-6"></div>
                    <p>After securing our first round of funding, we expanded to 10 new cities and launched our mobile app.</p>
                  </div>
                </div>
                <div className="md:w-1/2 md:pl-10 order-1 md:order-2">
                  <h3 className="text-xl font-semibold">2020 - First Expansion</h3>
                  <p className="text-gray-600">Secured $2M in seed funding and expanded nationwide</p>
                </div>
              </div>
            </div>
            
            <div className="mb-12">
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 md:pr-10 md:text-right mb-4 md:mb-0">
                  <h3 className="text-xl font-semibold">2022 - Recognition</h3>
                  <p className="text-gray-600">Named "Most Innovative Sharing Platform" by TechForward</p>
                </div>
                <div className="md:w-1/2 md:pl-10">
                  <div className="bg-white p-6 rounded-lg shadow-md relative">
                    <div className="absolute w-4 h-4 bg-blue-500 rounded-full -left-2 transform -translate-x-1/2 top-6"></div>
                    <p>Our commitment to sustainability and community building earned us industry recognition and a growing user base.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="">
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 md:pr-10 md:text-right mb-4 md:mb-0 order-2 md:order-1">
                  <div className="bg-white p-6 rounded-lg shadow-md relative">
                    <div className="absolute w-4 h-4 bg-blue-500 rounded-full -right-2 transform translate-x-1/2 top-6"></div>
                    <p>Today we serve over 500,000 users across 3 countries with plans for European expansion next year.</p>
                  </div>
                </div>
                <div className="md:w-1/2 md:pl-10 order-1 md:order-2">
                  <h3 className="text-xl font-semibold">2024 - Today</h3>
                  <p className="text-gray-600">Serving half a million users across North America</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Core Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gray-50 p-8 rounded-xl text-center hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <FaHandshake className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Trust</h3>
              <p className="text-gray-600">We build transparent systems that foster trust between community members.</p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-xl text-center hover:shadow-lg transition-shadow">
              <div className="bg-green-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <FaLightbulb className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Innovation</h3>
              <p className="text-gray-600">We constantly evolve our platform to better serve our community's needs.</p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-xl text-center hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <FaUsers className="text-purple-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Community</h3>
              <p className="text-gray-600">We believe in the power of people helping people through shared resources.</p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-xl text-center hover:shadow-lg transition-shadow">
              <div className="bg-yellow-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <FaChartLine className="text-yellow-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Sustainability</h3>
              <p className="text-gray-600">We're committed to reducing waste by maximizing resource utilization.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Team */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">Meet The Team</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <img src={team1} alt="Team Member" className="w-full h-64 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-1">Alex Johnson</h3>
                <p className="text-blue-600 mb-3">CEO & Co-founder</p>
                <p className="text-gray-600">Visionary leader passionate about sustainable business models.</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <img src={team2} alt="Team Member" className="w-full h-64 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-1">Maria Garcia</h3>
                <p className="text-blue-600 mb-3">CTO</p>
                <p className="text-gray-600">Tech innovator building secure, scalable platforms.</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <img src={team3} alt="Team Member" className="w-full h-64 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-1">Jamal Williams</h3>
                <p className="text-blue-600 mb-3">Head of Community</p>
                <p className="text-gray-600">Connector who believes in the power of sharing economies.</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <img src={team4} alt="Team Member" className="w-full h-64 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-1">Priya Patel</h3>
                <p className="text-blue-600 mb-3">Head of Sustainability</p>
                <p className="text-gray-600">Environmental advocate measuring our ecological impact.</p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium">
              View All Team Members
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">500K+</div>
              <div className="text-lg">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">120K+</div>
              <div className="text-lg">Listings Available</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">3</div>
              <div className="text-lg">Countries</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-lg">Positive Ratings</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Join Our Community?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Whether you have items to share or need temporary access to things, we've got you covered.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium">
              List an Item
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium">
              Browse Listings
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;