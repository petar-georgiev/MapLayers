var osmMap = L.tileLayer.provider("OpenStreetMap.Mapnik", { maxZoom: 23 });
var imageryMap = L.tileLayer.provider("Esri.WorldImagery", { maxZoom: 23 });
var orthophoto = L.tileLayer.wms(
  "https://kade.si/cgi-bin/mapserv?SERVICE=WMS&VERSION=1.3.0",
  {
    layers: "orthophoto-BG-2022",
    maxZoom: 23,
  }
);
var cadastreParcels = L.tileLayer.wms(
  "https://inspire.cadastre.bg/arcgis/services/Cadastral_Parcel/MapServer/WMSServer",
  {
    layers: "0",
    maxZoom: 23,
    format: "image/png",
    transparent: true,
  }
);

var cadastreBuildings = L.tileLayer.wms(
  "https://inspire.cadastre.bg/arcgis/rest/services/Building/MapServer",
  {
    layers: "0",
    maxZoom: 23,
    format: "image/png",
    transparent: true,
  }
);

var cadastreLayers = L.layerGroup([cadastreParcels, cadastreBuildings]);

var baseMap = {
  OSM: osmMap,
  "World Imagery": imageryMap,
  "Aerial View": orthophoto,
};

var overlayMaps = {
  Cadastre: cadastreLayers,
};

var map = L.map("map", {
  center: [42.137813164634395, 24.75264725348793],
  zoom: 13,
  layers: [osmMap],
});

var ctlMeasure = L.control
  .polylineMeasure({
    position: "topleft",
    measureControlTitle: "Measure Length",
  })
  .addTo(map);

function highlightFeature(e) {
  var layer = e.target;
  layer.setStyle({
    weight: 5,
    color: "#666",
    dashArray: "",
    fillOpacity: 0.7,
  });
  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }
  info.update(layer.feature.properties);
}

var municipalityLayer;

function resetHighlight(e) {
  municipalityLayer.resetStyle(e.target);
  info.update();
}
function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature,
  });
}

var municipalityLayer = L.geoJSON(geojsonFeature, {
  onEachFeature: onEachFeature,
}).addTo(map);

municipalityLayer.remove();

var layerGroup = L.control.layers(baseMap, overlayMaps).addTo(map);
layerGroup.addOverlay(municipalityLayer, "Municipalities");
