var request = loadExternalScript("http://www.openlayers.org/api/OpenLayers.js");

$.ajax('loading.html', function (data, textStatus, jqXHR) {
    $('.container').prepend(data);
    loadCss('loading');
});

request.done(function () {

    $('.loading').remove();
    var options = {
        enableHighAccuracy: true,
        timeout: 2 * 1000,
        maximumAge: 0
    }

    if( isset(window.navigator) )
        window.navigator.geolocation.getCurrentPosition(showMap, function () { alert("Can't load the map!") }, options);
    else
        navigator.geolocation.getCurrentPosition(showMap, function () { alert("Can't load the map!") }, options);
});

function showMap(position) {
    var lon = position.coords.longitude;
    var lat = position.coords.latitude;
    var zoom = 13;
    var map = new OpenLayers.Map("map");
    map.addLayer(new OpenLayers.Layer.OSM({
        controls: [
        new OpenLayers.Control.Navigation(),
                   new OpenLayers.Control.ScaleLine(),
                   new OpenLayers.Control.Permalink('permalink'),
                   new OpenLayers.Control.MousePosition(),
                   new OpenLayers.Control.Attribution()
        ],
        projection: new OpenLayers.Projection("EPSG:900913"),
        displayProjection: new OpenLayers.Projection("EPSG:4326")
    }));
    map.zoomToMaxExtent();

    var mapnik = new OpenLayers.Layer.OSM("OpenStreetMap (Mapnik)");

    map.addLayer(mapnik);

    var lonLat = new OpenLayers.LonLat(lon, lat)
          .transform(
            new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
            map.getProjectionObject() // to Spherical Mercator Projection
    );

    map.setCenter(lonLat, zoom);
}