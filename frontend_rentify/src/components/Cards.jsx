import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';

const Cards = ({ item }) => {
  const [isHeartFilled, setIsHeartFilled] = useState(false);

  const handleHeartClick = () => {
    setIsHeartFilled(!isHeartFilled);
  };

  // Function to truncate description to 100 characters
  const truncateDescription = (text) => {
    if (text.length <= 100) return text;
    return text.substring(0, 100) + '...';
  };

  return (
    <div className="p-4">
      <div className="card bg-base-100 w-96 shadow-xl relative border-2 border-purple rounded-lg">
        {/* Heart Icon */}
        <div
          className={`rating gap-1 absolute right-2 top-2 p-4 heartStar bg-purple ${isHeartFilled ? 'text-rose-500' : 'text-white'}`}
          onClick={handleHeartClick}
        >
          <FaHeart className="h-5 w-5 cursor-pointer" />
        </div>

        {/* Image and Link */}
        <Link to={`/item/${item._id}`}>
          <figure>
            <img
              src={item.images && item.images.length > 0 ? item.images[0] : '/placeholder.jpg'}
              alt={item.title}
              className="hover:scale-105 transition-all duration-200 md:h-72 rounded-t-lg"
            />
          </figure>
        </Link>

        {/* Card Body */}
        <div className="card-body p-6">
          <h2 className="card-title text-2xl font-bold mb-2">{item.title}</h2>
          <p className="text-gray-600 mb-4">
            {truncateDescription(item.description || '')}
          </p>
          <div className="card-actions justify-between items-center mt-2">
            <h5 className="font-semibold text-xl">
              <span className="text-sm text-red-500">Rs. </span>
              {item.pricePerDay}
            </h5>
            <button className="btn bg-purple-yellow-gradient text-white">
              Rent Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cards;