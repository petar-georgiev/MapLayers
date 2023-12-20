var osmMap = L.tileLayer.provider("OpenStreetMap.Mapnik", { maxZoom: 23 });
var imageryMap = L.tileLayer.provider("Esri.WorldImagery", { maxZoom: 23 });
var orthophoto = L.tileLayer.wms(
  "https://kade.si/cgi-bin/mapserv?SERVICE=WMS&VERSION=1.3.0",
  {
    layers: "orthophoto-BG-2022",
    maxZoom: 23,
  }
);
var imoti = L.tileLayer.wms(
  "https://inspire.cadastre.bg/arcgis/services/Cadastral_Parcel/MapServer/WMSServer",
  {
    layers: "0",
    maxZoom: 23,
    format: "image/png",
    transparent: true,
  }
);

var baseMap = {
  OSM: osmMap,
  "World Imagery": imageryMap,
  "Aerial View": orthophoto,
};

var overlayMap = {
  imoti: imoti,
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

$.getJSON("resources/data/municipalities_names.geojson", function (data) {
  var municipalitiesLayer = L.geoJSON(data, {
    style: function (feature) {
      return { color: "black", fillColor: "red" };
    },
  })
    .bindPopup(function (layer) {
      return "<h3> Община: </h3>" + layer.feature.properties.name;
    })
    .addTo(map);

  layerGroup.addOverlay(municipalitiesLayer, "Municipalities");
});
var layerGroup = L.control.layers(baseMap, overlayMap).addTo(map);
