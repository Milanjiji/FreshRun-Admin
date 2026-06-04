"use client";

import React, { useCallback, useRef } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100%",
};

interface MapComponentProps {
  center: { lat: number; lng: number };
  onCenterChange: (lat: number, lng: number) => void;
}

export default function MapComponent({ center, onCenterChange }: MapComponentProps) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyC1s78p6_QNfF7eoMbKnMcu5wLqOdLyN9g",
  });

  const mapRef = useRef<google.maps.Map | null>(null);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(function callback() {
    mapRef.current = null;
  }, []);

  const handleDragEnd = () => {
    if (mapRef.current) {
      const newCenter = mapRef.current.getCenter();
      if (newCenter) {
        onCenterChange(newCenter.lat(), newCenter.lng());
      }
    }
  };

  if (!isLoaded) return <div className="h-full w-full flex items-center justify-center bg-gray-100">Loading Map...</div>;

  return (
    <div className="relative h-full w-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={15}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onDragEnd={handleDragEnd}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
        }}
      >
        <Marker 
          position={center} 
          draggable={true}
          onDragEnd={(e) => {
            if (e.latLng) {
               onCenterChange(e.latLng.lat(), e.latLng.lng());
            }
          }}
        />
      </GoogleMap>
    </div>
  );
}
