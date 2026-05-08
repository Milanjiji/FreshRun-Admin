"use client";

import React, { useState, useEffect } from "react";
import { X, MapPin, Check, Crosshair } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import Leaflet components to avoid SSR errors
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const useMapEvents = dynamic(() => import("react-leaflet").then((mod) => mod.useMapEvents), { ssr: false });
const useMap = dynamic(() => import("react-leaflet").then((mod) => mod.useMap), { ssr: false });

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (lat: string, lng: string) => void;
  initialLat?: string;
  initialLng?: string;
}

// Internal component to handle map events
function MapEventsHandler({ onCenterChange }: { onCenterChange: (lat: number, lng: number) => void }) {
  const mapEvents = useMapEvents({
    moveend: () => {
      const center = mapEvents.getCenter();
      onCenterChange(center.lat, center.lng);
    },
  });
  return null;
}

// Component to handle programmatic map movement
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    if (map) map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

export default function LocationPickerModal({
  isOpen,
  onClose,
  onConfirm,
  initialLat,
  initialLng
}: LocationPickerModalProps) {
  const [coords, setCoords] = useState({
    lat: parseFloat(initialLat || "11.2588"),
    lng: parseFloat(initialLng || "75.7804")
  });

  // Reset to initial when opened OR ask for location if not set
  useEffect(() => {
    if (isOpen) {
      if (initialLat && initialLng) {
        setCoords({
          lat: parseFloat(initialLat),
          lng: parseFloat(initialLng)
        });
      } else if (navigator.geolocation) {
        // If no initial location, ask for current GPS immediately
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          },
          (err) => {
            console.warn("Geolocation error:", err);
            // Fallback to default if user denies
            setCoords({ lat: 11.2588, lng: 75.7804 });
          }
        );
      }
    }
  }, [isOpen, initialLat, initialLng]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-white">
          <div>
            <h2 className="text-xl font-bold text-foreground font-mont flex items-center gap-2">
              <MapPin className="text-primary" /> Set Store Location
            </h2>
            <p className="text-xs text-muted mt-1">Drag the map to place the pin at your store's exact location.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-muted" />
          </button>
        </div>

        {/* Map Container */}
        <div className="relative flex-1 min-h-[400px] bg-gray-50">
          {/* Leaflet Map */}
          <div className="absolute inset-0">
            <MapContainer 
              center={[coords.lat, coords.lng]} 
              zoom={15} 
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapEventsHandler onCenterChange={(lat, lng) => setCoords({ lat, lng })} />
              <RecenterMap lat={coords.lat} lng={coords.lng} />
            </MapContainer>
          </div>

          {/* Fixed Central Pin Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1000]">
            <div className="relative flex flex-col items-center mb-[40px]">
              {/* Pin Icon */}
              <div className="text-primary animate-bounce">
                <MapPin size={48} fill="white" strokeWidth={2.5} />
              </div>
              {/* Shadow/Target */}
              <div className="w-2 h-2 bg-black/20 rounded-full blur-[1px] mt-[-5px]" />
            </div>
          </div>

          {/* Coordinates Overlay */}
          <div className="absolute bottom-6 left-6 right-6 z-[1000] flex justify-between items-end">
            <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg border border-border text-[10px] font-mono space-y-1">
              <div className="flex justify-between gap-4">
                <span className="text-muted uppercase">LAT:</span>
                <span className="text-foreground font-bold">{coords.lat.toFixed(6)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted uppercase">LNG:</span>
                <span className="text-foreground font-bold">{coords.lng.toFixed(6)}</span>
              </div>
            </div>
            
            <button 
              onClick={() => {
                // Try to get actual GPS if browser supports it
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition((pos) => {
                    setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                  });
                }
              }}
              className="bg-white p-3 rounded-xl shadow-lg border border-border text-primary hover:bg-primary-light transition-colors"
              title="Find my location"
            >
              <Crosshair size={20} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-white border-t border-border flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-3 px-6 rounded-xl border border-border text-muted font-bold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => onConfirm(coords.lat.toString(), coords.lng.toString())}
            className="flex-2 py-3 px-6 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
          >
            <Check size={20} />
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
}
