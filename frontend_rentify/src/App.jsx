import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Cards from './Cards'; // Your cards component
import ItemDetail from './ItemDetail'; // The component that displays item details

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Route for the cards listing */}
        <Route path="/" element={<Cards />} />

        {/* Dynamic route for item details */}
        <Route path="/item/:id" element={<ItemDetail />} />
      </Routes>
    </Router>
  );
};

export default App;
