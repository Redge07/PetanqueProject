import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  LayersControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import { linkBackend } from "../../constants/LinkBackend";
import axios from "axios";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const { BaseLayer } = LayersControl;

const Map = ({ idTournament }) => {
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    axios
      .get(linkBackend + "log/positions/" + idTournament)
      .then((res) => {
        const valid = res.data.filter((p) => p.latitude && p.longitude);
        setPositions(valid);
      })
      .catch(() => {});
  }, []);

  if (positions.length === 0) return null;

  const center = [Number(positions[0].latitude), Number(positions[0].longitude)];

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
        <h3 className="font-semibold text-[var(--color-primary)] text-sm">
          Positions des joueurs
        </h3>
        <span className="text-xs text-[var(--color-gray)]">
          {positions.length} joueur{positions.length > 1 ? "s" : ""} localisé{positions.length > 1 ? "s" : ""}
        </span>
      </div>
      <div style={{ height: "360px" }}>
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <LayersControl position="topright">
            <BaseLayer name="Plan">
              <TileLayer
                attribution="© OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </BaseLayer>
            <BaseLayer checked name="Satellite">
              <TileLayer
                attribution="Tiles © Esri"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            </BaseLayer>
          </LayersControl>
          {positions.map((p, i) => (
            <Marker key={i} position={[Number(p.latitude), Number(p.longitude)]}>
              <Popup>
                <strong>{p.pseudo} n°{p.numero}</strong>
                {p.last_position_at && (
                  <>
                    <br />
                    {new Date(p.last_position_at).toLocaleString("fr-FR")}
                  </>
                )}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default Map;
