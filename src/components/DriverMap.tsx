import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DriverLocation, Order } from '../types';
import { Truck, Navigation, Phone } from 'lucide-react';
import { renderToString } from 'react-dom/server';

// Fix Leaflet default marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom icons
const createDriverIcon = () => {
  const svgString = renderToString(
    <div style={{ 
      backgroundColor: '#16a34a', 
      borderRadius: '50%', 
      padding: '8px',
      border: '3px solid white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
    }}>
      <Truck size={20} color="white" />
    </div>
  );
  
  return L.divIcon({
    html: svgString,
    className: 'custom-driver-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

const createDestinationIcon = () => {
  const svgString = renderToString(
    <div style={{ 
      backgroundColor: '#dc2626', 
      borderRadius: '50%', 
      padding: '8px',
      border: '3px solid white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
    }}>
      <Navigation size={20} color="white" />
    </div>
  );
  
  return L.divIcon({
    html: svgString,
    className: 'custom-destination-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

// Component to fit bounds to show both markers
function FitBounds({ driverLocation, destination }: { driverLocation: { lat: number; lng: number }; destination: { lat: number; lng: number } }) {
  const map = useMap();
  
  useEffect(() => {
    const bounds = L.latLngBounds(
      [driverLocation.lat, driverLocation.lng],
      [destination.lat, destination.lng]
    );
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  }, [map, driverLocation, destination]);
  
  return null;
}

interface DriverMapProps {
  driverLocation: DriverLocation;
  order: Order;
  destinationCoords?: { lat: number; lng: number } | null;
  showRoute?: boolean;
  className?: string;
  height?: string;
}

export function DriverMap({ 
  driverLocation, 
  order, 
  destinationCoords,
  showRoute = true,
  className = '',
  height = '400px'
}: DriverMapProps) {
  // Driver position
  const driverPos: [number, number] = [driverLocation.lat, driverLocation.lng];
  
  // Use provided destination or fallback to driver location
  const destPos: [number, number] = destinationCoords 
    ? [destinationCoords.lat, destinationCoords.lng]
    : driverPos;

  // Calculate route points (simplified - just a line between driver and destination)
  const routePoints: [number, number][] = showRoute ? [driverPos, destPos] : [];

  const lastUpdated = new Date(driverLocation.timestamp).toLocaleTimeString();

  return (
    <div className={`rounded-xl overflow-hidden shadow-lg ${className}`} style={{ height }}>
      <MapContainer
        center={driverPos}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Driver Marker */}
        <Marker position={driverPos} icon={createDriverIcon()}>
          <Popup>
            <div className="p-2 min-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-green-100 p-2 rounded-full">
                  <Truck size={16} className="text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{driverLocation.driverName}</p>
                  <p className="text-xs text-gray-500">Driver</p>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-gray-400" />
                  <a href={`tel:${driverLocation.driverPhone}`} className="text-blue-600 hover:underline">
                    {driverLocation.driverPhone}
                  </a>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Last updated: {lastUpdated}
                </p>
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Destination Marker (only if different from driver) */}
        {destinationCoords && (destinationCoords.lat !== driverLocation.lat || destinationCoords.lng !== driverLocation.lng) && (
          <Marker position={destPos} icon={createDestinationIcon()}>
            <Popup>
              <div className="p-2 min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-red-100 p-2 rounded-full">
                    <Navigation size={16} className="text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{order.userName}</p>
                    <p className="text-xs text-gray-500">Delivery Address</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  {order.address.street}, {order.address.city}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route Line */}
        {showRoute && routePoints.length === 2 && (
          <Polyline
            positions={routePoints}
            color="#16a34a"
            weight={4}
            opacity={0.8}
            dashArray="10, 10"
          />
        )}

        {/* Fit bounds to show both markers */}
        {destinationCoords && (
          <FitBounds 
            driverLocation={{ lat: driverLocation.lat, lng: driverLocation.lng }}
            destination={destinationCoords}
          />
        )}
      </MapContainer>
      
      {/* Info Overlay */}
      <div className="bg-white p-3 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-full">
              <Truck size={18} className="text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800">{driverLocation.driverName}</p>
              <p className="text-xs text-gray-500">Last updated: {lastUpdated}</p>
            </div>
          </div>
          <a 
            href={`tel:${driverLocation.driverPhone}`}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
          >
            <Phone size={16} />
            Call Driver
          </a>
        </div>
      </div>
    </div>
  );
}

// Simplified map for driver to see their current location
export function DriverLocationMap({ 
  position, 
  onPositionChange 
}: { 
  position: { lat: number; lng: number } | null;
  onPositionChange?: (pos: { lat: number; lng: number }) => void;
}) {
  const defaultCenter: [number, number] = [20.5937, 78.9629];
  const mapRef = useRef<L.Map | null>(null);

  function LocationMarker() {
    const map = useMap();
    
    useEffect(() => {
      mapRef.current = map;
      
      if (!position) {
        // Try to get current location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
              if (onPositionChange) {
                onPositionChange(newPos);
              }
              map.flyTo([newPos.lat, newPos.lng], 15);
            },
            () => {
              console.log('Could not get location');
            }
          );
        }
      }
    }, [map]);

    useEffect(() => {
      if (position && mapRef.current) {
        mapRef.current.flyTo([position.lat, position.lng], 15);
      }
    }, [position]);

    return position ? (
      <Marker position={[position.lat, position.lng]} icon={createDriverIcon()}>
        <Popup>Your current location</Popup>
      </Marker>
    ) : null;
  }

  return (
    <div className="rounded-xl overflow-hidden shadow-lg" style={{ height: '300px' }}>
      <MapContainer
        center={position ? [position.lat, position.lng] : defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker />
      </MapContainer>
    </div>
  );
}
