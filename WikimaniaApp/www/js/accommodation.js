var request = loadExternalScript("http://www.openlayers.org/api/OpenLayers.js");

request.done(function () {
    map = new OpenLayers.Map("map");
    map.addLayer(new OpenLayers.Layer.OSM());
    map.zoomToMaxExtent();
});