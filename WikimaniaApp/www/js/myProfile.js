﻿var request = loadExternalScript("http://www.openlayers.org/api/OpenLayers.js");
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
    //$('#refresh_map_btn').on('touchstart', locateUser);
});

if (!isset(getFromStorage('hasSeenTutorialProfile')))
    window.setTimeout(function () {
        $('.arrow').hide();
        $('.arrowLabel').hide();
        store('hasSeenTutorialProfile', 'true');
    }, 5000);
else {
    $('.arrow').hide();
    $('.arrowLabel').hide();
}

function locateUser() {
    if (isset(map)) {
        map.destroy();
        map = null;
        markers.destroy();
        markers = null;
    }
    var options = {
        enableHighAccuracy: true,
        timeout: 15 * 1000,
        maximumAge: 300 * 1000
    };
    if (isset(window.navigator))
        window.navigator.geolocation.getCurrentPosition(showMap, function () { alert("Can't load the map!") }, options);
    else
        navigator.geolocation.getCurrentPosition(showMap, function () { alert("Can't load the map!") }, options);
}

function showMap(position) {
    var lon = position.coords.longitude;
    var lat = position.coords.latitude;

    store('lastUserLon', lon);
    store('lastUserLat', lat);

    var zoom = 16;
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
    addMarker(lon, lat, 'img/mapIcons/user.png', null, 32, 37);

    addMarker(9.32882, 45.99384, 'img/mapIcons/toilet.png', null, 32, 37);
    addMarker(9.32905, 45.99384, 'img/mapIcons/toilet_disability.png', null, 32, 37);

    addMarker(9.33201, 45.99432, 'img/mapIcons/toilet.png', null, 32, 37);

    userData.getMyEvents();
    userData.getAccomodation();
}

function addMarker(longitude, latitude, icon, eventHandler, width, height) {
    if (!isset(width))
        width = 32;
    if (!isset(height))
        height = 32;

    if (!isset(markers)) {
        markers = new OpenLayers.Layer.Markers("Markers");
        map.addLayer(markers);
    }

    var markerLonLat = new OpenLayers.LonLat(longitude, latitude)
          .transform(
            new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
            map.getProjectionObject() // to Spherical Mercator Projection
    );
    var offset = { x: 0, y: -20 };
    var icon = new OpenLayers.Icon(icon, new OpenLayers.Size(width, height), offset);
    var marker = new OpenLayers.Marker(markerLonLat, icon);
    markers.addMarker(marker);
}

var userData = {
    getMyEvents: function () {
        $.ajax({
            url: API.serverAddress + 'events/booked',
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
                var today = new Date();
                for (var i = 0; i < data.data.length; i++) {
                    var day = new Date(data.data[i].date);

                    if (isset(data.data[i].places) && day > today)
                        for(var k = 0; k < data.data[i].places.length; k++)
                        {
                            addMarker(data.data[i].places[k].longitude, data.data[i].places[k].latitude, 'img/mapIcons/event.png', null, 32, 37);
                        }
                }
            }
        });
    },
    getAccomodation: function(){
        $.ajax({
            url: API.serverAddress + 'accomodation',
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
                },
                404: function () {
                    if( !isset(getFromStorage('hasNoAccomodation')) ){
                        navigator.notification.alert("Warning! You have no accomodation in Esino.", function () {
                            store('hasNoAccomodation', 'true');
                        }, "Warning!", "Understood!");
                        
                    }
                    $('.buttonAccomodation').addClass('disabled');
                }
            },
            success: function (data) {
                var longitude = data.data.accomodation.longitude;
                var latitude = data.data.accomodation.latitude;
                var icon = 'img/mapIcons/home.png';
                $('.buttonAccomodation').attr('href', 'https://maps.google.com?saddr=Current+Location&daddr=' + latitude + ',' + longitude);
                addMarker(longitude, latitude, icon, null, 32, 37);
            }
        });
    }
};