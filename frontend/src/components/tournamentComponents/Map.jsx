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

// Fix icônes Leaflet (obligatoire)
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
      .then((res) => setPositions(res.data))
      .catch((error) =>
        console.error("Erreur lors de la récupération des positions:", error),
      );
  }, []);

  if (!positions || positions.length === 0) {
    return <p>Aucune position à afficher</p>;
  }

  const center = [
    Number(positions[0].latitude),
    Number(positions[0].longitude),
  ];

  return (
    <div
      style={{
        height: "500px",
        width: "100%",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <p>{positions.length} positions</p>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <LayersControl position="topright">
          {/* Plan */}
          <BaseLayer name="Plan">
            <TileLayer
              attribution="© OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </BaseLayer>

          {/* Satellite */}
          <BaseLayer checked name="Satellite">
            <TileLayer
              attribution="Tiles © Esri"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </BaseLayer>
        </LayersControl>

        {positions.map((p) => (
          <Marker
            key={p.id}
            position={[Number(p.latitude), Number(p.longitude)]}
          >
            <Popup>
              <strong>
                {p.pseudo} numéro {p.numero}
              </strong>
              <br />
              Dernière position :
              <br />
              {p.last_position_at &&
                new Date(p.last_position_at).toLocaleString()}
            </Popup>
          </Marker>
        ))}
        <Marker key="unknown" position={[44.808036, 4.352189]}>
          <Popup>
            <strong>Inconnu</strong>
            <br />
            Dernière position : Jamais
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default Map;
