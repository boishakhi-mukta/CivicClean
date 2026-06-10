import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance';
import { Link } from 'react-router-dom';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl:       require('leaflet/dist/images/marker-icon.png'),
  shadowUrl:     require('leaflet/dist/images/marker-shadow.png'),
});

const DEFAULT_CENTER = [59.9139, 10.7522];

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
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-text mb-3">Interactive Issue Map</h1>
        <p className="text-muted mb-8">Explore reported issues in your community.</p>

        <div className="h-[420px] sm:h-[520px] lg:h-[620px] w-full rounded-xl overflow-hidden shadow-xl border border-border relative z-0">
          <MapContainer
            center={DEFAULT_CENTER}
            zoom={12}
            scrollWheelZoom={true}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {issues.map((issue, i) => {
              const lat = issue.location?.lat || (DEFAULT_CENTER[0] + (Math.random() - 0.5) * 0.1);
              const lng = issue.location?.lng || (DEFAULT_CENTER[1] + (Math.random() - 0.5) * 0.1);

              return (
                <Marker position={[lat, lng]} key={issue._id || i}>
                  <Popup>
                    <div className="p-1">
                      <h3 className="font-bold text-base mb-1">{issue.title}</h3>
                      <p className="text-sm text-gray-500 mb-2">{issue.category}</p>
                      <Link
                        to={`/explore/${issue._id}`}
                        className="text-sm font-semibold text-blue-600 hover:underline"
                      >
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
