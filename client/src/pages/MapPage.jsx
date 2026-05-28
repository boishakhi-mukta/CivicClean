import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance';
import { Link } from 'react-router-dom';

// Fix Leaflet's default icon path issues with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

const defaultCenter = [23.8103, 90.4125]; // Dhaka, Bangladesh

const MapPage = () => {
  useEffect(() => {
    document.title = "CivicClean | Issue Map";
  }, []);

  const { data: issues = [], isLoading } = useQuery({
    queryKey: ['mapIssues'],
    queryFn: async () => {
      const res = await axiosInstance.get('/issues?limit=1000');
      return res.data.issues;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#1a3a2a] dark:border-[#d4ff00]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 transition-colors">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-[#1a3a2a] dark:text-white mb-6">Interactive Issue Map</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Explore reported issues in your community.
        </p>

        <div className="h-[600px] w-full rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 relative z-0">
          <MapContainer center={defaultCenter} zoom={12} scrollWheelZoom={true} className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {issues.map((issue, i) => {
              const lat = issue.location?.lat || (defaultCenter[0] + (Math.random() - 0.5) * 0.1);
              const lng = issue.location?.lng || (defaultCenter[1] + (Math.random() - 0.5) * 0.1);

              return (
                <Marker position={[lat, lng]} key={issue._id || i}>
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-bold text-lg mb-1">{issue.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{issue.category}</p>
                      <Link to={`/issues/${issue._id}`} className="text-blue-600 font-semibold hover:underline">
                        View Details &rarr;
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
