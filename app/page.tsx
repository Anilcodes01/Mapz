"use client";
import { useState, useEffect } from "react";
import useGeolocation from "../app/hooks/useGeoLocation";
import MapComponent from "../app/components/MapComponent";
import axios from "axios";
import { Company } from "@/types/types";
import { Loader2, Search, ArrowLeft, ArrowRight } from "lucide-react";


export default function Home() {
  const { location, error } = useGeolocation();
  const [industry, setIndustry] = useState("technology");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const fetchCompanies = async (
    lat: number,
    lng: number,
    searchIndustry: string
  ) => {
    setLoading(true);
    setCompanies([]);
    setSelectedCompany(null);
    
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
  }, [location]); 

  const handleSearch = () => {
    if (!location) return;
    fetchCompanies(location.lat, location.lng, industry);
  };

  return (
    <div className="flex h-screen relative">
    
     <div className="">
     <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="absolute top-4  left-2 z-50 text-black bg-white p-2 rounded-full shadow-lg"
      >
        {isSidebarOpen ? <ArrowLeft  /> : <ArrowRight />}
      </button>

      
      <div className="absolute top-4 right-2 z-50 flex gap-2">
        <input
          type="text"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          placeholder="Enter industry..."
          className="px-4 py-2 border text-black  outline-none rounded-full shadow-lg"
        />
        <button
          onClick={handleSearch}
          disabled={!location || loading}
          className="p-2 bg-blue-500 absolute  right-0 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 shadow-lg"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Search />}
        </button>
      </div>
     </div>


      <div
        className={`bg-white w-full lg:w-96  h-screen overflow-y-auto transition-transform duration-300 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } absolute left-0 top-0 z-40 shadow-lg`}
      >
        <div className="p-4 pt-20">
          <h2 className="text-xl font-semibold text-black  mb-4">Nearby Places</h2>
          
          {loading && (
            <div className="text-center py-4">
              <p className="text-gray-600">Loading places...</p>
            </div>
          )}

          {companies.length === 0 && !loading && (
            <div className="text-center py-4">
              <p className="text-gray-600">No places found</p>
            </div>
          )}

          {companies.map((company, index) => (
            <div
              key={index}
              className={`p-4 mb-2 text-black border rounded-lg cursor-pointer transition-colors ${
                selectedCompany?.name === company.name
                  ? 'bg-blue-50 border-blue-200'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => setSelectedCompany(company)}
            >
              <h3 className="font-bold text-black">{company.name}</h3>
              <p className="text-gray-600 text-sm">{company.address}</p>
              <p className="text-gray-500 text-sm mt-1">
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
              {company.type && (
                <p className="text-gray-500 text-sm">Type: {company.type}</p>
              )}
              {company.phone && (
                <p className="text-gray-500 text-sm">Phone: {company.phone}</p>
              )}
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 text-sm hover:underline block mt-1"
                >
                  Visit Website
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      
      <div className="flex-1">
        {error && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50">
            <p className="text-red-500 bg-white px-4 py-2 rounded-lg shadow-lg">
              {error}
            </p>
          </div>
        )}

        {!location && !error && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50">
            <p className="text-gray-600 bg-white px-4 py-2 rounded-lg shadow-lg">
              Detecting your location...
            </p>
          </div>
        )}

        {location && (
          <MapComponent
            location={location}
            companies={companies}
            selectedCompany={selectedCompany}
            onCompanySelect={setSelectedCompany}
          />
        )}
      </div>
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