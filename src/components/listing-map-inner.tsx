"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface ListingMapInnerProps {
  latitude: number;
  longitude: number;
  name: string;
  address: string;
}

const pinIcon = L.divIcon({
  className: "",
  html: `<div style="
    width: 32px;
    height: 32px;
    background: #2563EB;
    border: 3px solid #ffffff;
    border-radius: 50% 50% 50% 0;
    transform: translate(-50%, -100%) rotate(-45deg);
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
});

export default function ListingMapInner({
  latitude,
  longitude,
  name,
  address,
}: ListingMapInnerProps) {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={15}
      className="h-full w-full rounded-lg"
      zoomControl={true}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[latitude, longitude]} icon={pinIcon}>
        <Popup>
          <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>{name}</p>
          <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0" }}>
            {address}
          </p>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
