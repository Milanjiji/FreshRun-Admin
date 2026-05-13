"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon in Leaflet
const icon = L.icon({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapComponentProps {
  center: { lat: number; lng: number };
  onCenterChange: (lat: number, lng: number) => void;
}

function MapEventsHandler({ onCenterChange }: { onCenterChange: (lat: number, lng: number) => void }) {
  const mapEvents = useMapEvents({
    moveend: () => {
      const center = mapEvents.getCenter();
      onCenterChange(center.lat, center.lng);
    },
  });
  return null;
}

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    if (map) map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

export default function MapComponent({ center, onCenterChange }: MapComponentProps) {
  return (
    <MapContainer 
      center={[center.lat, center.lng]} 
      zoom={15} 
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEventsHandler onCenterChange={onCenterChange} />
      <RecenterMap lat={center.lat} lng={center.lng} />
    </MapContainer>
  );
}
