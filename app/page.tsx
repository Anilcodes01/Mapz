"use client";
import { useState, useEffect } from "react";
import useGeolocation from "../app/hooks/useGeoLocation";
import MapComponent from "../app/components/MapComponent";
import axios from "axios";

export default function Home() {
  const { location, error } = useGeolocation();
  const [industry, setIndustry] = useState("technology");
  const [companies, setCompanies] = useState<
    {
      name: string;
      lat: number;
      lng: number;
      address: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const fetchCompanies = async (
    lat: number,
    lng: number,
    searchIndustry: string
    
  ) => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `/api/search?lat=${lat}&lng=${lng}&industry=${searchIndustry}`
      );
      setCompanies(data);
    } catch (error) {
      console.error("Error fetching companies:", error);
      alert("Error fetching companies.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location) {
      fetchCompanies(location.lat, location.lng, industry);
    }
  }, [location, industry]);

  const handleSearch = () => {
    if (!location) return;
    fetchCompanies(location.lat, location.lng, industry);
  };

  return (
    <div className="  lg:w-full bg-white mx-auto">
   
      <div className="flex absolute mt-2 z-50 gap-2 px-4 mb-4 items-center justify-center sm:right-0">
        <input
          type="text"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          placeholder="Enter industry..."
          className="px-4 py-2 border text-black outline-none rounded-full flex-grow"
        />
        <button
          onClick={handleSearch}
          disabled={!location || loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300"
        >
          {loading ? "Loading" : "Search"}
        </button>
      </div>
     

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {!location && !error && (
        <p className="text-gray-600 mb-4">Detecting your location...</p>
      )}

      {location && (
        <div className="rounded-lg md:relative overflow-hidden shadow-lg">
          <MapComponent location={location} companies={companies} />
        </div>
      )}

      {companies.length > 0 && (
        <div className="mt-4 text-black">
          <h2 className="text-xl font-semibold mb-2">Nearby Places</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <h3 className="font-bold">{company.name}</h3>
                <p className="text-gray-600">{company.address}</p>
                <p className="text-sm text-gray-500">
                  Distance:{" "}
                  {location &&
                    calculateDistance(
                      location.lat,
                      location.lng,
                      company.lat,
                      company.lng
                    ).toFixed(2)}{" "}
                  km
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}
