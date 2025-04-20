import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import useAxiosPublic from '../hooks/useAxiosPublic';

const ItemsMap = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const axiosPublic = useAxiosPublic();

  // Default to Kathmandu center
  const [mapCenter] = useState([27.7172, 85.3240]);
  
  // Create custom icon from item image
  const createCustomIcon = (imageUrl) => {
    return new L.DivIcon({
      html: `
        <div style="
          width: 50px;
          height: 50px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8f9fa;
        ">
          <img 
            src="${imageUrl}" 
            alt="Item" 
            style="
              width: 100%;
              height: 100%;
              object-fit: cover;
            "
            onerror="this.src='https://via.placeholder.com/50'"
          />
        </div>
      `,
      className: 'custom-marker-icon',
      iconSize: [50, 50],
      iconAnchor: [25, 50], // Center bottom of the circle
      popupAnchor: [0, -50] // Popup appears above marker
    });
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axiosPublic.get('/rent');
        setItems(response.data);
      } catch (err) {
        console.error('Error fetching items:', err);
        setError('Failed to load items. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [axiosPublic]);

  if (loading) return <div className="text-center py-8">Loading map...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="w-full relative" style={{ height: '80vh' }}>
      <h1 className="text-2xl font-bold text-center my-4">All Rental Items on Map</h1>
      
      {/* Add CSS for the map container */}
      <style jsx>{`
        .leaflet-container {
          height: 100%;
          width: 100%;
          z-index: 1;
        }
        .leaflet-popup-content {
          margin: 12px;
        }
      `}</style>
      
      
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: '100%', width: '100%', borderRadius: '8px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {items.map((item) => {
          if (!item.location?.coordinates || !Array.isArray(item.location.coordinates)) {
            return null;
          }
          
          const [longitude, latitude] = item.location.coordinates;
          const position = [latitude, longitude];
          const itemImage = item.images?.[0] || 'https://via.placeholder.com/50';
          
          return (
            <Marker
              key={item._id}
              position={position}
              icon={createCustomIcon(itemImage)}
            >
              <Popup>
                <div className="max-w-xs">
                  <h3 className="font-bold text-lg">{item.title}</h3>
                  <p className="text-sm text-gray-600 capitalize">{item.category}</p>
                  <p className="text-purple-600 font-medium">Rs. {item.pricePerDay}/day</p>
                  {item.images?.[0] && (
                    <img 
                      src={item.images[0]} 
                      alt={item.title} 
                      className="w-full h-32 object-cover mt-2 rounded"
                    />
                  )}
                  <a 
                    href={`/item/${item._id}`} 
                    className="block mt-2 text-center bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200 transition"
                  >
                    View Details
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default ItemsMap;