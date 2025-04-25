import React, { useEffect, useState } from "react";
import Cards from "../../../components/Cards";
import { FaFilter, FaSearch, FaTimes } from "react-icons/fa";

const Rent = () => {
    const [menu, setMenu] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [sortOption, setSortOption] = useState("default");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(8);
    const [searchQuery, setSearchQuery] = useState("");
    const [priceRange, setPriceRange] = useState([0, 10000]);
    const [showFilters, setShowFilters] = useState(false);
    const [maxPrice, setMaxPrice] = useState(10000);
  
    useEffect(() => {
      // Fetch data from the backend
      const fetchData = async () => {
        try {
          const response = await fetch("http://localhost:6001/rent");
          const data = await response.json();
          setMenu(data);
          setFilteredItems(data);
          // Set max price from data
          const calculatedMaxPrice = Math.max(...data.map(item => item.pricePerDay), 10000);
          setMaxPrice(calculatedMaxPrice);
          setPriceRange([0, calculatedMaxPrice]);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
  
      fetchData();
    }, []);
  
    // Combined filter function
    useEffect(() => {
      let filtered = [...menu];
      
      // Category filter
      if (selectedCategory !== "all") {
        filtered = filtered.filter((item) => item.category === selectedCategory);
      }
      
      // Search filter
      if (searchQuery) {
        filtered = filtered.filter(item => 
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      // Price range filter
      filtered = filtered.filter(item => 
        item.pricePerDay >= priceRange[0] && item.pricePerDay <= priceRange[1]
      );
      
      // Sorting
      switch (sortOption) {
        case "A-Z":
          filtered.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case "Z-A":
          filtered.sort((a, b) => b.title.localeCompare(a.title));
          break;
        case "low-to-high":
          filtered.sort((a, b) => a.pricePerDay - b.pricePerDay);
          break;
        case "high-to-low":
          filtered.sort((a, b) => b.pricePerDay - a.pricePerDay);
          break;
        default:
          break;
      }
      
      setFilteredItems(filtered);
      setCurrentPage(1);
    }, [menu, selectedCategory, searchQuery, priceRange, sortOption]);
  
    const showAll = () => {
      setSelectedCategory("all");
      setSearchQuery("");
      setPriceRange([0, maxPrice]);
    };
  
    const handlePriceChange = (e, index) => {
      const value = parseInt(e.target.value);
      const newPriceRange = [...priceRange];
      
      // Ensure min doesn't exceed max and vice versa
      if (index === 0 && value <= priceRange[1]) {
        newPriceRange[0] = value;
      } else if (index === 1 && value >= priceRange[0]) {
        newPriceRange[1] = value;
      }
      
      setPriceRange(newPriceRange);
    };
  
    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
    return (
      <div className="overflow-x-hidden">
        <div className="max-w-screen-2xl container mx-auto xl:px-24 px-4 bg-gradient-to-r from-0% from-[#FAFAFA] to-[#FCFCFC] to-100%">
          {/* Hero Section */}
          <div className="py-5 flex flex-col items-center justify-center mt-20">
            <h1 className="text-3xl font-bold mb-4">Rent Anything <spam className = "text-purple">You Need</spam></h1>
            <p className="text-gray-600 text-center max-w-2xl">
              Find the perfect items to rent for your needs at affordable prices.
            </p>
          </div>
        </div>
  
        {/* Search and Filter Section */}
        <div className="section-container mx-auto px-4 mb-8 ml-20 mr-20">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Enhanced Search Bar */}
            <div className="relative w-full md:w-1/2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search items by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-3 pl-10 pr-4 rounded-lg border  focus:outline-none focus:ring-2 focus:ring-purple border-purple focus:border-transparent shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <FaTimes className="text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            
            {/* Filter and Sort Buttons */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-sm transition-colors ${showFilters ? 'bg-purple text-white' : 'bg-white text-gray-700 border border-purple hover:bg-gray-50'}`}
              >
                <FaFilter className="h-4 w-4" />
                {showFilters ? 'Hide Filters' : 'Filters'}
              </button>
              
              <div className="relative">
                <select
                  id="sort"
                  onChange={(e) => setSortOption(e.target.value)}
                  value={sortOption}
                  className="appearance-none bg-white  text-gray-700 py-3 px-4 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple border border-purple focus:border-transparent"
                >
                  <option value="default">Sort: Default</option>
                  <option value="A-Z">Sort: A-Z</option>
                  <option value="Z-A">Sort: Z-A</option>
                  <option value="low-to-high">Sort: Price Low to High</option>
                  <option value="high-to-low">Sort: Price High to Low</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
  
          {/* Expanded Filters Panel */}
          {showFilters && (
            <div className="bg-white p-6 rounded-lg shadow-md mt-4 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
                <button 
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Price Range Filter */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Price Range (per day)</h4>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Rs. {priceRange[0]}</span>
                    <span className="text-sm text-gray-600">Rs. {priceRange[1]}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      value={priceRange[0]}
                      onChange={(e) => handlePriceChange(e, 0)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      value={priceRange[1]}
                      onChange={(e) => handlePriceChange(e, 1)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
                
                {/* Category Filter */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Categories</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {[
                      { id: "all", name: "All" },
                      { id: "vehicles", name: "Vehicles" },
                      { id: "electronics", name: "Electronics" },
                      { id: "clothes", name: "Clothes" },
                      { id: "house", name: "House & Apartments" },
                      { id: "sports", name: "Sports" },
                      { id: "musical", name: "Musical" },
                      { id: "equipment", name: "Equipment" },
                      { id: "books", name: "Books" },
                      { id: "others", name: "Others" }
                    ].map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          selectedCategory === category.id
                            ? "bg-purple text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={showAll}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Reset All
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple rounded-md hover:bg-purple"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>
  
        {/* Product Grid */}
        <div className="section-container ml-14">
          {/* product card */}
          <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 p-2 lg:p-2">
            {currentItems.length > 0 ? (
              currentItems.map((item) => (
                <Cards key={item._id} item={item} />
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <h3 className="text-xl font-semibold">No items found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
                <button 
                  onClick={showAll}
                  className="mt-4 px-4 py-2 bg-purple text-white rounded-md hover:bg-purple"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
  
        {/* Pagination */}
        {filteredItems.length > itemsPerPage && (
          <div className="flex justify-center my-8">
            <nav className="inline-flex rounded-md shadow-sm -space-x-px">
              {currentPage > 1 && (
                <button
                  onClick={() => paginate(currentPage - 1)}
                  className="px-3 py-2 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                >
                  Previous
                </button>
              )}
              
              {Array.from({ length: Math.ceil(filteredItems.length / itemsPerPage) }).map((_, index) => {
                // Show only nearby pages for better UX
                if (
                  index === 0 ||
                  index === Math.ceil(filteredItems.length / itemsPerPage) - 1 ||
                  (index >= currentPage - 2 && index <= currentPage + 2)
                ) {
                  return (
                    <button
                      key={index + 1}
                      onClick={() => paginate(index + 1)}
                      className={`px-3 py-2 border border-gray-300 ${
                        currentPage === index + 1
                          ? "bg-purple text-white border-purple"
                          : "bg-white text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                }
                return null;
              })}
              
              {currentPage < Math.ceil(filteredItems.length / itemsPerPage) && (
                <button
                  onClick={() => paginate(currentPage + 1)}
                  className="px-3 py-2 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                >
                  Next
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
    );
}

export default Rent;