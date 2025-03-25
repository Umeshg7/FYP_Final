import React, { useEffect, useState } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import Cards from "../../components/Cards";
import { FaAngleRight, FaAngleLeft } from "react-icons/fa6";

const SampleNextArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, display: "block", background: "red" }}
      onClick={onClick}
    >
      NEXT
    </div>
  );
};

const SamplePrevArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, display: "block", background: "purple" }}
      onClick={onClick}
    >
      BACK
    </div>
  );
};

const SpecialItems = () => {
  const [recipes, setRecipes] = useState([]);
  const slider = React.useRef(null);

  useEffect(() => {
    fetch("http://localhost:6001/rent")
      .then((res) => res.json())
      .then((data) => {
        const shuffledData = shuffleArray(data);
        const randomRecipes = shuffledData.slice(0, 5);
        setRecipes(randomRecipes);
        console.log(data);
      });
  }, []);

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    initialSlide: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 970,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 1,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
  };

  return (
    <div className="max-w-screen-2xl container mx-auto xl:px-24 px-4 relative">
      <div className="text-left mb-20">
        <p className="subtitle font-semibold text-purple text-5xl">Most Rented Items</p>
      </div>
      <div className="md:absolute right-3 top-8 mb-20 md:mr-24">
        <button
          onClick={() => slider?.current?.slickPrev()}
          className="btn p-2 rounded-full ml-5"
        >
          <FaAngleLeft className="h-8 w-8 p-1" />
        </button>
        <button
          className="bg-purple btn p-2 rounded-full ml-5"
          onClick={() => slider?.current?.slickNext()}
        >
          <FaAngleRight className="h-8 w-8 p-1" />
        </button>
      </div>

      <div>
        <Slider
          ref={slider}
          {...settings}
          className="overflow-hidden mt-10"
        >
          {recipes.map((item, i) => (
            <Cards item={item} key={i} />
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default SpecialItems;