var request = loadExternalScript("http://www.openlayers.org/api/OpenLayers.js");
var map;
var markers;

$.ajax('loading.html', function (data, textStatus, jqXHR) {
    $('.container').prepend(data);
    loadCss('loading');
});

$(".buttonEvents").click(function () {
    showPage("myEvents");
    
});
request.done(function () {
    $('.loading').remove();
    locateUser();
    $('#refresh_map_btn').on('touchstart', locateUser);
});

function locateUser() {
    var options = {
        enableHighAccuracy: true,
        timeout: 100 * 1000,
        maximumAge: 0
    };
    if (isset(window.navigator))
        window.navigator.geolocation.getCurrentPosition(showMap, function () { alert("Can't load the map!") }, options);
    else
        navigator.geolocation.getCurrentPosition(showMap, function () { alert("Can't load the map!") }, options);
}

function showMap(position) {
    var lon = position.coords.longitude;
    var lat = position.coords.latitude;
    var zoom = 13;
    if (!isset(map)) {
        map = new OpenLayers.Map("map", {
            controls: [
                new OpenLayers.Control.Navigation(),
            ],
            projection: new OpenLayers.Projection("EPSG:900913"),
            displayProjection: new OpenLayers.Projection("EPSG:4326")
        });
        map.addLayer(new OpenLayers.Layer.OSM());
        map.zoomToMaxExtent();

        var mapnik = new OpenLayers.Layer.OSM("OpenStreetMap (Mapnik)");

        map.addLayer(mapnik);

        var lonLat = new OpenLayers.LonLat(lon, lat)
              .transform(
                new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
                map.getProjectionObject() // to Spherical Mercator Projection
        );
    }
    map.setCenter(lonLat, zoom);
    addMarker(lon, lat, null, null);
    addMarker(10, 45, 'img/accommodationIcon.png', function () { alert(); });
}

function addMarker(longitude, latitude, icon, eventHandler) {
    if (!isset(markers)) {
        markers = new OpenLayers.Layer.Markers("Markers");
        map.addLayer(markers);
    }

    var markerLonLat = new OpenLayers.LonLat(longitude, latitude)
          .transform(
            new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
            map.getProjectionObject() // to Spherical Mercator Projection
    );

    var icon = new OpenLayers.Icon(icon, new OpenLayers.Size(64, 64));
    var marker = new OpenLayers.Marker(markerLonLat, icon);
    markers.addMarker(marker);
}

var userData = {
    getMyEvents: function () {
        $.ajax({
            url: APIServerAddress + 'events',
            type: 'GET',
            async: true,
            dataType: 'json',
            headers: {
                'X-Auth-Token': API.token
            },
            statusCode: {
                400: function () {
                    alert("Server error. Please retry later.");
                },
                403: function () {
                    API.token = '';
                    window.location.reload();
                }
            },
            success: function (data) {
                for( var i = 0; i < data.data.length; i++ ){
                    //TODO: aggiungere i marker sugli eventi...
                }
            }
        });
    }
};