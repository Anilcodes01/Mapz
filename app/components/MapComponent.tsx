"use client";
import { useState, useEffect } from "react";
import Map, { Marker, Popup } from "react-map-gl/maplibre";
import 'maplibre-gl/dist/maplibre-gl.css';
import { Company } from "@/types/types";

interface MapProps {
  location: { lat: number; lng: number };
  companies: Company[];
  selectedCompany: Company | null;
  onCompanySelect: (company: Company | null) => void;
}

const MapComponent = ({
  location,
  companies,
  selectedCompany,
  onCompanySelect
}: MapProps) => {
  const [viewState, setViewState] = useState({
    longitude: location.lng,
    latitude: location.lat,
    zoom: 13
  });

  
  useEffect(() => {
    if (selectedCompany) {
      setViewState({
        longitude: Number(selectedCompany.lng),
        latitude: Number(selectedCompany.lat),
        zoom: 15
      });
    }
  }, [selectedCompany]);

  return (
    <Map
      {...viewState}
      onMove={evt => setViewState(evt.viewState)}
      style={{ width: "100%", height: "100vh" }}
      mapStyle={`https://api.maptiler.com/maps/streets-v2/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`}
      mapLib={import('maplibre-gl')}
    >
      
      <Marker
        longitude={location.lng}
        latitude={location.lat}
        color="#2563eb"
      />

    
      {companies.map((company, index) => (
        <Marker
          key={index}
          longitude={Number(company.lng)}
          latitude={Number(company.lat)}
          color={selectedCompany?.name === company.name ? "#dc2626" : "#ef4444"}
          scale={selectedCompany?.name === company.name ? 1.2 : 1}
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            onCompanySelect(company);
          }}
        />
      ))}

      {selectedCompany && (
        <Popup
          longitude={Number(selectedCompany.lng)}
          latitude={Number(selectedCompany.lat)}
          closeButton={true}
          closeOnClick={false}
          onClose={() => onCompanySelect(null)}
          anchor="bottom"
        >
          <div className="p-2 text-black">
            <h3 className="font-bold">{selectedCompany.name}</h3>
            <p className="text-sm">{selectedCompany.address}</p>
            {selectedCompany.type && (
              <p className="text-sm text-gray-600">Type: {selectedCompany.type}</p>
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