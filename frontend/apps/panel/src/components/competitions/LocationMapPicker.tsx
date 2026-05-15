import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

// Vite asset workaround for default leaflet marker icons
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl })

const BELL_VILLE: [number, number] = [-32.5996, -62.6905]

interface LocationValue {
  latitude: number | null
  longitude: number | null
}

interface LocationMapPickerProps {
  value: LocationValue
  onChange: (coords: { latitude: number; longitude: number }) => void
  disabled?: boolean
}

function ClickHandler({ onChange, disabled }: { onChange: LocationMapPickerProps['onChange']; disabled?: boolean }) {
  useMapEvents({
    click(e) {
      if (!disabled) onChange({ latitude: e.latlng.lat, longitude: e.latlng.lng })
    },
  })
  return null
}

export default function LocationMapPicker({ value, onChange, disabled }: LocationMapPickerProps) {
  const position: [number, number] | null =
    value.latitude != null && value.longitude != null
      ? [value.latitude, value.longitude]
      : null

  return (
    <div className="location-map-picker">
      <MapContainer
        center={position ?? BELL_VILLE}
        zoom={14}
        style={{ width: '100%', height: '220px', borderRadius: '8px' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <ClickHandler onChange={onChange} disabled={disabled} />
        {position && (
          <DraggableMarker position={position} onChange={onChange} disabled={disabled} />
        )}
      </MapContainer>
      {position && (
        <p className="location-map-coords">
          {position[0].toFixed(5)}, {position[1].toFixed(5)}
        </p>
      )}
    </div>
  )
}

function DraggableMarker({
  position,
  onChange,
  disabled,
}: {
  position: [number, number]
  onChange: LocationMapPickerProps['onChange']
  disabled?: boolean
}) {
  return (
    <Marker
      position={position}
      draggable={!disabled}
      eventHandlers={{
        dragend(e) {
          const { lat, lng } = (e.target as L.Marker).getLatLng()
          onChange({ latitude: lat, longitude: lng })
        },
      }}
    />
  )
}
