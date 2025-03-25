import React, { useEffect, useState } from "react";
import Cards from "../../../components/Cards";
import { FaFilter } from "react-icons/fa";
import Categories from "../Categories";

const Rent = () => {

    const [menu, setMenu] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [sortOption, setSortOption] = useState("default");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(8); 
  
    useEffect(() => {
      // Fetch data from the backend
      const fetchData = async () => {
        try {
          const response = await fetch("http://localhost:6001/rent");
          const data = await response.json();
          setMenu(data);
          setFilteredItems(data); // Initially, display all items
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
  
      fetchData();
    }, []);
  
    const filterItems = (category) => {
      const filtered =
        category === "all"
          ? menu
          : menu.filter((item) => item.category === category);
  
      setFilteredItems(filtered);
      setSelectedCategory(category);
      setCurrentPage(1);
    };
  
    const showAll = () => {
      setFilteredItems(menu);
      setSelectedCategory("all");
      setCurrentPage(1); 
    };
  
    const handleSortChange = (option) => {
      setSortOption(option);
  
      // Logic for sorting based on the selected option
      let sortedItems = [...filteredItems];
  
      switch (option) {
        case "A-Z":
          sortedItems.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "Z-A":
          sortedItems.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case "low-to-high":
          sortedItems.sort((a, b) => a.price - b.price);
          break;
        case "high-to-low":
          sortedItems.sort((a, b) => b.price - a.price);
          break;
        default:
          // Do nothing for the "default" case
          break;
      }
  
      setFilteredItems(sortedItems);
      setCurrentPage(1);
    };
  
    console.log(filteredItems);
    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  
    return (
      <div className="overflow-x-hidden">
        <div className="max-w-screen-2xl container mx-auto xl:px-24 px-4 bg-gradient-to-r from-0% from-[#FAFAFA] to-[#FCFCFC] to-100%">
          <div className="py-5 flex flex-col items-center justify-center mt-10">
            {/* content */}
            <div className=" text-center px-40 space-y-7">
              <h2 className="md:text-5xl text-4xl font-bold md:leading-snug leading-snug mt-5">
                 Explore the Items  <span className="text-purple">For Rent</span>
              </h2>
              <Categories/>
            </div>
          </div>
        </div>
  
  
        {/* menu shop  */}
        <div className="section-container ml-14">
          <div className="flex flex-col md:flex-row flex-wrap md:justify-between items-center space-y-3 mb-8">
            
             {/* all category buttons */}
            <div className="flex flex-row justify-start md:items-center md:gap-8 gap-4  flex-wrap ml-24 font-semibold">
              <button
                onClick={showAll}
                className={selectedCategory === "all" ? "active" : ""}
              >
                All
              </button>
              <button
                onClick={() => filterItems("vegetables")}
                className={selectedCategory === "vegetables" ? "active" : ""}
              >
                Vehicles
              </button>
              <button
                onClick={() => filterItems("fruits")}
                className={selectedCategory === "fruits" ? "active" : ""}
              >
                Books
              </button>
              <button
                onClick={() => filterItems("meat")}
                className={selectedCategory === "meat" ? "active" : ""}
              >
                Clothes
              </button>
              <button
                onClick={() => filterItems("grains")}
                className={selectedCategory === "grains" ? "active" : ""}
              >
                House & Apartments
              </button>
              <button
                onClick={() => filterItems("dairy")}
                className={selectedCategory === "dairy" ? "active" : ""}
              >
                Sports Equipments
              </button>
              <button
                onClick={() => filterItems("drinks")}
                className={selectedCategory === "drinks" ? "active" : ""}
              >
                Others
              </button>
            </div>
  
              {/* filter options */}
            <div className="flex justify-end mb-4 rounded-sm">
              <div className="bg-green p-2 ">
                <FaFilter className="text-white h-4 w-4" />
              </div>
              <select
                id="sort"
                onChange={(e) => handleSortChange(e.target.value)}
                value={sortOption}
                className="bg-green text-white px-2 py-1 rounded-sm"
              >
                <option value="default"> Default</option>
                <option value="A-Z">A-Z</option>
                <option value="Z-A">Z-A</option>
                <option value="low-to-high">Low to High</option>
                <option value="high-to-low">High to Low</option>
              </select>
            </div>
          </div>
  
          {/* product card */}
          {/* product card */}
          <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 p-4 lg:p-8">
         {currentItems.map((item) => (
            <Cards key={item._id} item={item} />
            ))}
        </div>


        </div>
  
        <div className="flex justify-center my-3 mb-10">
          {Array.from({ length: Math.ceil(filteredItems.length / itemsPerPage) }).map((_, index) => (
            <button
              key={index + 1}
              onClick={() => paginate(index + 1)}
              className={`mx-1 px-3 py-1 rounded-full ${
                currentPage === index + 1 ? "bg-purple text-white" : "bg-gray-200"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
  
      </div>
    );
}

export default Rent