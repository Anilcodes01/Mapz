"use client";
import { useState } from "react";
import Map, { Marker, Popup } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

interface Company {
  name: string;
  lat: number;
  lng: number;
  address: string;
  type?: string;
  website?: string;
  phone?: string;
  opening_hours?: string;
}

interface MapProps {
  location: { lat: number; lng: number };
  companies: Company[];
}

const MapComponent = ({ location, companies }: MapProps) => {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const validLocation = {
    lat: Number(location.lat),
    lng: Number(location.lng),
  };

  if (
    isNaN(validLocation.lat) ||
    isNaN(validLocation.lng) ||
    validLocation.lat < -90 ||
    validLocation.lat > 90 ||
    validLocation.lng < -180 ||
    validLocation.lng > 180
  ) {
    return (
      <div className="p-4 text-red-500">
        Invalid location coordinates provided
      </div>
    );
  }

  const validCompanies = companies.filter((company) => {
    const lat = Number(company.lat);
    const lng = Number(company.lng);
    return (
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    );
  });

  return (
    <Map
      initialViewState={{
        longitude: validLocation.lng,
        latitude: validLocation.lat,
        zoom: 14,
      }}
      style={{ width: "100%", height: "500px", }}
      mapStyle={`https://api.maptiler.com/maps/streets-v2/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`}
      mapLib={import("maplibre-gl")}
      
    >
      <Marker
        longitude={validLocation.lng}
        latitude={validLocation.lat}
        color="blue"
      />

      {validCompanies.map((company, index) => (
        <Marker
          key={index}
          longitude={Number(company.lng)}
          latitude={Number(company.lat)}
          color="red"
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            setSelectedCompany(company);
          }}
        />
      ))}

      {selectedCompany && (
        <Popup
          longitude={Number(selectedCompany.lng)}
          latitude={Number(selectedCompany.lat)}
          closeButton={true}
          closeOnClick={false}
          onClose={() => setSelectedCompany(null)}
        >
          <div className="p-2 text-black">
            <h3 className="font-bold">{selectedCompany.name}</h3>
            <p className="text-sm">{selectedCompany.address}</p>
            {selectedCompany.type && (
              <p className="text-sm text-gray-600">
                Type: {selectedCompany.type}
              </p>
            )}
            {selectedCompany.phone && (
              <p className="text-sm">Phone: {selectedCompany.phone}</p>
            )}
            {selectedCompany.website && (
              <a
                href={selectedCompany.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:underline"
              >
                Visit Website
              </a>
            )}
          </div>
        </Popup>
      )}
    </Map>
  );
};

export default MapComponent;
