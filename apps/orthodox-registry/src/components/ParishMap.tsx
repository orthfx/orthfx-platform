import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import type { Parish } from '../types/parish';
import { useTheme } from './theme-provider';
import { OrthodoxCrossIcon, OrthodoxCrossIconSelected } from './OrthodoxCrossIcon';
import { Phone, Mail, Globe, Users } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Create Orthodox cross icon
const DefaultIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(OrthodoxCrossIcon),
  iconSize: [30, 41],
  iconAnchor: [15, 41],
  popupAnchor: [0, -41],
});

const SelectedIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(OrthodoxCrossIconSelected),
  iconSize: [30, 41],
  iconAnchor: [15, 41],
  popupAnchor: [0, -41],
});

interface ParishMapProps {
  parishes: Parish[];
  selectedParishId?: string;
  onParishClick?: (parish: Parish) => void;
}

function MapUpdater({ parishes }: { parishes: Parish[] }) {
  const map = useMap();

  useEffect(() => {
    if (parishes.length > 0) {
      const bounds = L.latLngBounds(
        parishes.map(p => [p.latitude, p.longitude])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [parishes, map]);

  return null;
}

export function ParishMap({ parishes, selectedParishId, onParishClick }: ParishMapProps) {
  const { theme } = useTheme();

  // Determine if we should use dark mode
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={isDark
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
        />
        <MapUpdater parishes={parishes} />
        {parishes.map((parish) => (
          <Marker
            key={parish.uid}
            position={[parish.latitude, parish.longitude]}
            icon={selectedParishId === parish.uid ? SelectedIcon : DefaultIcon}
            eventHandlers={{
              click: () => onParishClick?.(parish),
            }}
          >
            <Popup className={isDark ? 'dark' : ''}>
              <div className="min-w-[200px] bg-background text-foreground p-4 rounded-md border">
                <h3 className="font-bold text-sm mb-1 text-foreground">{parish.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {[parish.city, parish.state, parish.country].filter(Boolean).join(', ')}
                </p>

                {parish.organization && (
                  <p className="text-xs text-muted-foreground italic mb-2">{parish.organization}</p>
                )}

                {parish.clergy && parish.clergy.length > 0 && (
                  <div className="rounded text-xs mb-2">
                    <div className="flex items-center gap-1 mb-1">
                      <Users className="h-3 w-3" />
                      <span className="font-semibold">Clergy</span>
                    </div>
                    {parish.clergy.map((c, i) => (
                      <div key={i} className="text-foreground">
                        {c.name}{c.role ? ` - ${c.role}` : ''}
                      </div>
                    ))}
                  </div>
                )}

                {parish.contact && (
                  <div className="text-xs mb-2 space-y-1">
                    {parish.contact.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3" />
                        <span className="text-foreground">{parish.contact.phone}</span>
                      </div>
                    )}
                    {parish.contact.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3 w-3" />
                        <a href={`mailto:${parish.contact.email}`} className="text-primary hover:underline">{parish.contact.email}</a>
                      </div>
                    )}
                    {parish.contact.website && (
                      <div className="flex items-center gap-1.5">
                        <Globe className="h-3 w-3" />
                        <a href={parish.contact.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Website</a>
                      </div>
                    )}
                  </div>
                )}

                {parish.additional_info?.service_languages && (
                  <div className="inline-block text-xs px-2 py-1 mb-2">
                    {parish.additional_info.service_languages}
                  </div>
                )}

                <a
                  href={parish.detail_url || parish.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline block mt-2"
                >
                  Full Details →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
