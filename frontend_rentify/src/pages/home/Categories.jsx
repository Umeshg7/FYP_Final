import React from 'react';
import { Link } from 'react-router-dom';

const categoryItems = [
    { id: 1, title: "Vehicles & Transportation", image: "/car.png", },
    { id: 2, title: "Electronics & Gadgets", image: "/computer.png", },
    { id: 3, title: "Office & Business Equipment", image: "/office.png", },
    { id: 4, title: "Home & Lifestyle", image: "/house.png", },
    { id: 5, title: "Books", image: "/book.png", },
    { id: 6, title: "Music Instruments", image: "/musical.png", },
    { id: 7, title: "Sports & Outdoor Gear", image: "/sport.png", },
    { id: 8, title: "Fashion & Accessories", image: "/clothes.png",},
    { id: 9, title: "Others", image: "/others.png", },
    { id: 10, title: "Baby & Kids Items", image: "/baby.png", },
];

const Categories = () => {
    return (
        <div className="section-container overflow-hidden">
            <div className="text-center">
            </div>

            {/* Scrolling container */}
            <div className="relative overflow-hidden mt-12">
                <div className="flex gap-8 animate-scroll items-center mt-5">
                    {categoryItems.concat(categoryItems).map((item, index) => ( // Duplicating items
                        <Link to={item.link} key={index}>
                            <div className="shadow-lg border border-yellow rounded-md bg-white py-8 px-6 w-80 text-center cursor-pointer hover:-translate-y-3 transition">
                                <div className="flex w-full mx-auto item-center justify-center">
                                    <div className="bg-purple-yellow-gradient p-6 rounded-full">
                                        <img src={item.image} alt={item.title} className="w-24 h-24" />
                                    </div>
                                </div>
                                <div className="mt-6 space-y-1">
                                    <h3 className="font-bold text-lg">{item.title}</h3>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Categories;
