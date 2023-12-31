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
    styles: "",
    format: "image/png",
    transparent: true,
    version: "1.3.0",
    uppercase: true,
    maxZoom: 23,
    tileSize: 640,
  }
);

var cadastreBuildings = L.tileLayer.wms(
  "https://inspire.cadastre.bg/arcgis/rest/services/Building/MapServer",
  {
    layers: "0",
    styles: "",
    format: "image/png",
    transparent: true,
    version: "1.3.0",
    uppercase: true,
    maxZoom: 23,
    tileSize: 640,
    attribution: '<a href="https://inspire.egov.bg/">inspire.egov.bg</a>',
  }
);

var map = L.map("map", {
  center: [42.137813164634395, 24.75264725348793],
  zoom: 13,
  zoomControl: false,
  attributionControl: false,
  layers: [osmMap],
});

var municipalityLayer = L.geoJSON(geojsonFeature, {
  onEachFeature: onEachFeature,
}).addTo(map);

municipalityLayer.remove();

var cadastreLayers = L.layerGroup([cadastreBuildings, cadastreParcels]);

var baseMap = {
  OSM: osmMap,
  "World Imagery": imageryMap,
  "Aerial View": orthophoto,
};

var overlayMaps = {
  Cadastre: cadastreLayers,
  Manicipalities: municipalityLayer,
};

var layerGroup = L.control.layers(baseMap, overlayMaps).addTo(map);

var attributionControl;
var searchControl;

map.on("overlayadd", function (eventLayer) {
  if (eventLayer.name === "Manicipalities") {
    searchControl = new L.Control.Search({
      textPlaceholder: "Търси община...",
      layer: municipalityLayer,
      propertyName: "name",
    });

    map.addControl(searchControl);
  }

  if (eventLayer.name === "Cadastre") {
    if (window.AndroidGSM) {
      attributionControl = L.control
        .attribution({ prefix: '<a href="#">inspire.egov.bg</a>' })
        .addTo(map);
    } else {
      attributionControl = L.control
        .attribution({
          prefix: '<a href="https://inspire.egov.bg/">inspire.egov.bg</a>',
        })
        .addTo(map);
    }
  }
});
map.on("overlayremove", function (eventLayer) {
  if (eventLayer.name === "Manicipalities") {
    map.removeControl(searchControl);
  }
  if (eventLayer.name === "Cadastre") {
    map.removeControl(attributionControl);
  }
});

L.control
  .zoom({
    position: "bottomright",
  })
  .addTo(map);

var info = L.control();

info.onAdd = function (map) {
  this._div = L.DomUtil.create("div", "info");
  this.update();
  return this._div;
};

info.update = function (props) {
  if (props && props.name) {
    this._div.innerHTML = "<h2>Община: </h2>" + props.name;
    console.log(props.name);
  } else {
    this._div.innerHTML = ""; // or any default value
  }
};

info.addTo(map);

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
  var properties = e.target.feature.properties;
  console.log(properties);
  info.update(properties);
}

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

let loadingLayers = 0;
function changeLoadingLayers(by) {
  loadingLayers += by;
  if (loadingLayers <= 0) {
    loadingLayers = 0;
    document.querySelector("#loadingInfo").innerHTML = "";
  } else
    document.querySelector("#loadingInfo").innerHTML =
      "Зареждащи се слоеве: " + loadingLayers;
}
changeLoadingLayers(0);
