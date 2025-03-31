import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Cards from './Cards';
import ItemDetail from './ItemDetail';
import Layout from './components/Layout'; // New layout component

const App = () => {
  return (
    <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Cards />} />
              <Route path="/item/:id" element={<ItemDetail />} />
              {/* Add more routes as needed */}
            </Routes>
          </Layout>
        </Router>
      
    </AuthProvider>
  );
};

export default App;