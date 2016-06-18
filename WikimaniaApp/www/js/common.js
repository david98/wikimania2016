/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * 'License'); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/*Variabili globali utilizzati da ogni parte dell'app*/
var currentPage = 'index';
var pageNames = ['eventList', 'eventSingle', 'restaurantList', 'restaurantSingle', 'accommodation', 'about', 'myEvents', 'myProfile'];
var menuHTML = '';
var userId;
var APIServerAddress = 'http://185.53.148.24/api/v1/';

var vw = window.innerWidth / 100;
var slideout;

$(document).ready(function () {

    $(window).resize(function () {
        vw = window.innerWidth / 100;

        if (isset(slideout))
            rebuildSlideout();
    });

    $('body').on('touchstart', '#menu_btn', function () {
        slideout.toggle();
        $('#backButton', $('body')).toggle();
    });

    $('body').on('touchstart', '.navbar_list_element p', function (event) {
        showPage(event.target.id);
        slideout.close();
        $('#backButton', $('body')).show();
    });

    $('body').on('click', '.restaurantImg', function (event) {
        if( currentPage !== 'restaurantSingle' )
            showPage('restaurantSingle', {
                'name': $(event.target).parent().attr('data-name'),
                'address': $(event.target).parent().attr('data-address'),
                'latitude': $(event.target).parent().attr('data-latitude'),
                'longitude': $(event.target).parent().attr('data-longitude'),
                'distance': $(event.target).parent().attr('data-distance'),
                'phone_number': $(event.target).parent().attr('data-phone_number')
            });
    });

    $('body').on('click', '.restaurantTitle', function (event) {
        if( currentPage !== 'restaurantSingle' )
            showPage('restaurantSingle', {
                'name': $(event.target).parent().parent().attr('data-name'),
                'address': $(event.target).parent().parent().attr('data-address'),
                'latitude': $(event.target).parent().parent().attr('data-latitude'),
                'longitude': $(event.target).parent().parent().attr('data-longitude'),
                'distance': $(event.target).parent().parent().attr('data-distance'),
                'phone_number': $(event.target).parent().parent().attr('data-phone_number')
            });
    });

    $('body').on('touchstart', '.buttonEvents', function () {
        showPage('myEvents');
    });

    window.addEventListener('popstate', previousPage);
    $('body').on('click', '#backButton', function () {
        goBack();
    });

    $('body').on('click', '.eventImg', function (event) {
        if( currentPage !== 'eventSingle' )
            showPage('eventSingle', $(event.target).parent().attr('id'));
    });

    $('body').on('click', '.eventTitle', function (event) {
        if( currentPage !== 'eventSingle')
            showPage('eventSingle', $(event.target).parent().parent().attr('id'));
    });

    /*$(document).on('deviceready', function () {
        document.addEventListener('backbutton', goBack, false);
    });*/
});

$.when($.ajax('menu.html')).then(function (data, textStatus, jqXHR) {
    menuHTML = data;
});

function isset(variable) {
    return typeof (variable) != 'undefined' && variable !== null;
}

function goBack(event) {
    history.back();
}

function previousPage(event) {
    console.log(event.state.name);
    if( isset(event.state.name) )
        showPage(event.state.name, event.state.parameters, false, true);
}

function rebuildSlideout() {
    if ( isset(slideout) )
        slideout.destroy();
    try{
        slideout = new Slideout({
            'panel': document.getElementById('panel'),
            'menu': document.getElementById('menu'),
            'padding': vw * 70,
            'tolerance': vw * 10
        });
    } catch (err) {
        console.log(err);
    }

}

function bindEvents() {
    
}

function daGradiARadianti(gradi){
    return (gradi * Math.PI) / 180;
}

/*
TODO: calcola la distanza tra a e b, dove a e b sono oggetti {lon: , lat: }
*/
function distanceBetween(a, b) {
    var p1 = {
        lon: daGradiARadianti(a.lon),
        lat: daGradiARadianti(a.lat)
    };

    var p2 = {
        lon: daGradiARadianti(b.lon),
        lat: daGradiARadianti(b.lat)
    };

    var distance = Math.acos((Math.sin(p1.lat) * Math.sin(p2.lat)) + (Math.cos(p1.lat) * Math.cos(p2.lat) * Math.cos(p2.lon - p1.lon))) * 6371 * 1000;
    return distance;
}

/*
parameters è un oggetto contenente dati richiesti per la visualizzazione della pagina name
*/
function showPage(name, parameters, refresh, goingBack) {
    refresh = refresh || false;
    goingBack = goingBack || false;
    if (name !== currentPage || isset(refresh)) {

        var noMenuLoaded = false;
        var currentContainer;

        if (currentPage === 'index')
            noMenuLoaded = true;
        else
            currentContainer = $('.container');

        $.when(
            $.ajax('loading.html').then(function (data, textStatus, jqXHR) {

                loadCss('loading');

                if (noMenuLoaded)
                    $('body').html(data);
                else
                    currentContainer.html(data);

                if (noMenuLoaded) {
                    $('body').prepend(menuHTML);
                    if (API.token === 'public') {
                        $('#myProfile').parent().remove();
                    }
                    currentContainer = $('.container');
                    $('#logo, #menu, #panel').hide();
                }

                API[name](name, currentContainer, noMenuLoaded, parameters);

                if (name !== 'logout') {
                    for (var i = 0; i < pageNames.length; i++)
                        unloadCss(pageNames[i]);

                    if (noMenuLoaded) {
                        rebuildSlideout();
                        slideout.disableTouch();
                        unloadCss('index');
                        loadCss('common');
                        loadCss('font-awesome/css/font-awesome.min');
                    }

                    loadCss(name);

                    if (!goingBack) {
                        historyItem = {
                            name: name,
                            parameters: parameters
                        };

                        history.pushState(historyItem, name, name + '.html');
                    }
                }
            })
        );
    }
}

function loadCss(name) {
    if (!$("link[href='css/" + name + ".css']").length)
        $('<link href="css/' + name + '.css" rel="stylesheet">').appendTo("head");
}

function unloadCss(name) {
    $("link[href='css/" + name + ".css']").remove();
}

function loadScript(name) {
    return $.getScript('js/' + name + '.js');
}

function loadExternalScript(URL) {
    return $.getScript(URL);
}

function store(name, value) {
    if (typeof (Storage) !== 'undefined') {
        // Code for localStorage/sessionStorage.
        localStorage.setItem(name, value);
        return true;
    } else {
        // Sorry! No Web Storage support..
    }
}

function getFromStorage(name) {
    if (typeof (Storage) !== 'undefined') {
        // Code for localStorage/sessionStorage.
        return localStorage.getItem(name);
    } else {
        // Sorry! No Web Storage support..
    }
}

var API = {

    token: '',

    serverAddress: 'http://185.53.148.24/api/v1/',

    login: function (id) {
        if (id === 'volontario') {
            this.token = 'public';
            store('userToken', this.token);
            showPage('eventList');
            return;
        }
    
        var data = {
            key: id
        };
        var that = this;

        $.ajax({
            url: this.serverAddress + 'login',
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            statusCode: {
                400: function () {
                    alert('Server error. Please retry later.');
                },
                403: function () {
                    navigator.notification.alert('Wrong code', null, 'Login error', 'Retry');
                }
            },
            success: function (msg) {
                that.token = msg.data['token'];
                store('userToken', that.token);
                showPage('eventList');
            }
        });
    },

    logout: function () {

        if (this.token === 'public') {
            store('userToken', '');
            var historyItem = {
                name: 'index',
                parameters: null
            };
            history.replaceState(historyItem, 'index', 'index.html');
            window.location.reload();
            return;
        }

        var that = this;
        $.ajax({
            url: this.serverAddress + 'logout',
            type: 'GET',
            dataType: 'json',
            headers: {
                'X-Auth-Token': that.token
            },
            statusCode: {
                400: function () {
                    alert('Server error. Please retry later.');
                },
            },
            success: function (data) {
                store('userToken', '');
                var historyItem = {
                    name: 'index',
                    parameters: null
                };
                history.replaceState(historyItem, 'index', 'index.html');
                window.location.reload();
            }
        });
    },

    eventList: function (pageName, currentContainer, noMenuLoaded) {
        var that = this;
        $.ajax({
            url: this.serverAddress + 'events',
            type: 'GET',
            dataType: 'json',
            headers: {
                'X-Auth-Token': that.token
            },
            statusCode: {
                400: function () {
                    alert('Server error. Please retry later.');
                },
                403: function () {
                    that.token = '';
                    window.location.reload();
                }
            },
            success: function (data) {
                API.show(pageName, data, currentContainer, noMenuLoaded);
            }
        });
    },

    restaurantList: function (pageName, currentContainer, noMenuLoaded) {
        var that = this;
        $.ajax({
            url: this.serverAddress + 'restaurants',
            type: 'GET',
            dataType: 'json',
            headers: {
                'X-Auth-Token': that.token
            },
            statusCode: {
                400: function () {
                    alert('Server error. Please retry later.');
                },
            },
            success: function (data) {
                API.show(pageName, data, currentContainer, noMenuLoaded);
            }
        });
    },

    eventSingle: function (pageName, currentContainer, noMenuLoaded, idEvent) {
        var that = this;
        $.ajax({
            url: this.serverAddress + 'event/' + idEvent,
            type: 'GET',
            dataType: 'json',
            headers: {
                'X-Auth-Token': that.token
            },
            statusCode: {
                400: function () {
                    alert('Server error. Please retry later.');
                },
            },
            success: function (data) {
                API.show(pageName, data, currentContainer, noMenuLoaded);
            }
        });
    },

    myProfile: function (pageName, currentContainer, noMenuLoaded) {

        if (this.token === 'public' ) {
            navigator.notification.alert('You can\'t access this page. Try logging in with a code.', null, 'Warning!', 'Ok!');
            goBack();
            return;
        }

        var that = this;
        $.ajax({
            url: this.serverAddress + 'profile',
            type: 'GET',
            dataType: 'json',
            headers: {
                'X-Auth-Token': that.token
            },
            statusCode: {
                400: function () {
                    alert('Server error. Please retry later.');
                },
            },

            success: function (data) {
                API.show(pageName, data, currentContainer, noMenuLoaded);
            }
        });
    },

    myEvents: function (pageName, currentContainer, noMenuLoaded) {
        if (this.token === 'public') {
            navigator.notification.alert('You can\'t access this page. Try logging in with a code.', null, 'Warning!', 'Ok!');
            goBack();
            return;
        }

        var that = this;
        $.ajax({
            url: this.serverAddress + 'events/booked',
            type: 'GET',
            dataType: 'json',
            headers: {
                'X-Auth-Token': that.token
            },
            statusCode: {
                400: function () {
                    alert('Server error. Please retry later.');
                },
            },

            success: function (data) {
                API.show(pageName, data, currentContainer, noMenuLoaded);
            }
        });
    },

    restaurantSingle: function (pageName, currentContainer, noMenuLoaded, data) {
               API.show(pageName, data, currentContainer, noMenuLoaded);
    },

    toggleBook: function (id, hasBooked) {

        if (this.token === 'public') {
            navigator.notification.alert('You can\'t access this page. Try logging in with a code.', null, 'Warning!', 'Ok!');
            goBack();
            return;
        }

        var that = this;
        var request = '';
        var urlPath = '';

        if (!hasBooked) {
            request = 'POST';
            urlPath = '/book';
        }
        else {
            request = 'DELETE';
            urlPath = '/unbook';
        }
        
        $.ajax({
                url: this.serverAddress + 'event/' + id + urlPath,
                type: request,
                dataType: 'json',
                headers: {
                    'X-Auth-Token': that.token
                },
                statusCode: {
                    400: function () {
                        alert('Server error. Please retry later.');
                    },
                },

                success: function (data) {
                    showPage('eventSingle', id, true);
                }
            });
    },

    about: function(pageName, currentContainer, noMenuLoaded, data){
        $.get(pageName + '.html', function (data) {
            API.show(pageName, data, currentContainer, noMenuLoaded);
        });
    },

    show: function (pageName, jsonData, currentContainer, noMenuLoaded, parameters) {
        var newContainer = $('<div></div>');
        newContainer.addClass('container');

        //costruire l'html da inserire
        $.ajax(pageName + '.html').done(function (pageData) {

            switch (pageName) {
                case 'eventList': {

                    jsonData.data.sort(sortMethods.date);

                    var pageHTML = $.parseHTML(pageData);
                    var baseEvent = $('.singleEvent', pageHTML)[0];
                    $('.singleEvent', pageHTML).remove();

                    newContainer.append(pageHTML);

                    var today = new Date();
                    var previousDay = today;
                    var dateTitle = null;
                    for (var i = 0; i < jsonData.data.length; i++)
                    {
                        var day = new Date(jsonData.data[i].date + ((jsonData.data[i].start !== '00:00:00') ? (' ' + jsonData.data[i].start) : ' 23:59:59'));

                        if (day > today) {
                            var newEvent = $(baseEvent).clone();

                            $(newEvent).attr('id', jsonData.data[i].id);
                            if (isset(jsonData.data[i].type) && jsonData.data[i].type !== 'null' && jsonData.data[i].type !== '')
                                $('.eventType', newEvent).text(jsonData.data[i].type);
                            else
                                $('.eventType', newEvent).remove();

                            if (jsonData.data[i].hasBooked) {
                                $('.eventSubs', newEvent).text('Booked!');
                            }
                            else {
                                if (isset(jsonData.data[i].places) && jsonData.data[i].places.length != 0) {
                                    var totalCapacity = 0;
                                    for (var k = 0; k < jsonData.data[i].places.length; k++) {
                                        totalCapacity += parseInt(jsonData.data[i].places[k].capacity);
                                    }

                                    if (totalCapacity != 0) {
                                        $('.eventNum', newEvent).text('/' + totalCapacity);
                                    }

                                }

                                $('.eventSubs', newEvent).prepend(jsonData.data[i].bookings);
                            }

                            var imgSrc = (isset(jsonData.data[i].image) && jsonData.data[i].image != '') ? jsonData.data[i].image : 'img/events/noEventImage.png';
                            $('.eventImg', newEvent).attr('src', imgSrc);

                            $('.eventTitle', newEvent).text(jsonData.data[i].title);

                            if (day.getDate() !== previousDay.getDate()) {
                                dateTitle = $('<h2></h2>').text(getMonthName(day.getMonth()) + ' ' + day.getDate());
                                dateTitle.addClass('dateTitle');
                            } else
                                dateTitle = null;
                            var timeString = jsonData.data[i].start;
                            var dayText = getMonthName(day.getMonth()) + ' ' + day.getDate() + ' ' + timeString.substring(0, 5);
                            $('.eventDate', newEvent).append(' ' + dayText);

                            if (isset(dateTitle))
                                newContainer.append(dateTitle);
                            newContainer.append(newEvent);

                            previousDay = day;
                        }

                    }

                    break;
                }

                case 'restaurantList': {

                    var options = {
                        enableHighAccuracy: true,
                        timeout: 100 * 1000,
                        maximumAge: 0
                    };

                    window.navigator.geolocation.getCurrentPosition(function (position) {
                        var userPosition = {
                            lon: position.coords.longitude,
                            lat: position.coords.latitude
                        };

                        var pageHTML = $.parseHTML(pageData);
                        var baseRestaurant = $('.singleRestaurant', pageHTML)[0];
                        $('.singleRestaurant', pageHTML).remove();

                        newContainer.append(pageHTML);

                        for (var i = 0; i < jsonData.data.length; i++) {
                            var newRestaurant = $(baseRestaurant).clone();

                            $('.restaurantImg', newRestaurant).attr('src', jsonData.data[i].image);

                            $(newRestaurant).attr('id', jsonData.data[i].id);

                            //aggiungo tutti i dati come attributi, in modo da ottenerli facilmente
                            $(newRestaurant).attr('data-name', jsonData.data[i].name);
                            $(newRestaurant).attr('data-address', jsonData.data[i].address);
                            $(newRestaurant).attr('data-latitude', jsonData.data[i].latitude);
                            $(newRestaurant).attr('data-longitude', jsonData.data[i].longitude);
                            $(newRestaurant).attr('data-phone_number', jsonData.data[i].phone_number);

                            $('.restaurantTitle', newRestaurant).text(jsonData.data[i].name);

                            $('.restaurantPhone', newRestaurant).append(' ' + jsonData.data[i].phone_number);
                            $('.restaurantPhone', newRestaurant).attr('href', 'tel:' + jsonData.data[i].phone_number);

                            var restaurantPosition = {
                                lon: jsonData.data[i].longitude,
                                lat: jsonData.data[i].latitude
                            };

                            var distance = distanceBetween(userPosition, restaurantPosition).toFixed(0);
                            $(newRestaurant).attr('data-distance', distance);
                            $('.restaurantDistance', newRestaurant).text(distance + ' m');

                            newContainer.append(newRestaurant);
                        }

                    }, null, options);

                   
                    break;
                }

                case 'eventSingle': {
                    var pageHTML = $.parseHTML(pageData);

    
                    $(pageHTML).attr('id', jsonData.data.event.id);
                    $('.eventTitle', pageHTML).text(jsonData.data.event.title);

                    var imgSrc = (isset(jsonData.data.event.image) && jsonData.data.event.image != '') ? jsonData.data.event.image : 'img/events/noEventImage.png';
                    $('.eventImg', pageHTML).attr('src', imgSrc);


                    

                    var day = new Date(jsonData.data.event.date);
                    var timeString = jsonData.data.event.start;
                    var dayText = getMonthName(day.getMonth()) + ' ' + day.getDate() + ' ' + timeString.substring(0, 5);
                    $('.eventDate', pageHTML).append(' ' + dayText);


                    for (var i = 0; i < jsonData.data.event.places.length; i++) 
                        $('.eventDesc', pageHTML).append(jsonData.data.event.places[i].place + '(' + jsonData.data.event.places[i].address + '), ');

                    if (jsonData.data.event.speaker != '')
                        $('.eventDesc', pageHTML).append('the speaker ' + jsonData.data.event.speaker + ' will talk for ' + GetHourDiff(jsonData.data.event.start, jsonData.data.event.end) +' hours.');
                    else if (jsonData.data.event.end != '00:00:00')
                        $('.eventDesc', pageHTML).append('and will last for ' +  GetHourDiff(jsonData.data.event.start, jsonData.data.event.end) + ' hours.');
                    else if (jsonData.data.event.start == '00:00:00')
                        $('.eventDesc', pageHTML).append('and will take place during the day.');
                    else
                        $('.eventDesc', pageHTML).append('and will start at ' + jsonData.data.event.start + '.');

                    if (jsonData.data.event.type != 'null')
                        $('.eventDesc', pageHTML).append('<br>Type: ' + jsonData.data.event.type);

                    if (jsonData.data.event.theme != 'null')
                        $('.eventDesc', pageHTML).append('<br>Theme: ' + jsonData.data.event.theme);

                    var totalCapacity = 0;
                    var hasUndefinedCapacityPlace = false;
                    for (var k = 0; k < jsonData.data.event.places.length && !hasUndefinedCapacityPlace; k++)
                    {
                        var thisPlaceCapacity = parseInt(jsonData.data.event.places[k].capacity) || 0;
                        if (thisPlaceCapacity == 0)
                            hasUndefinedCapacityPlace = true;
                        else
                            totalCapacity += thisPlaceCapacity;
                    }

                    if (API.token === 'public')
                        $('.eventBtn', pageHTML).parent().replaceWith('<br />');
                    else if (!jsonData.data.event.hasBooked) {
                        if( !hasUndefinedCapacityPlace )
                            $('.eventNum', pageHTML).text(totalCapacity + ' seats left!');
                        $('.eventBtn', pageHTML).text('Subscribe');
                    }
                    else
                    {
                        $('.eventNum', pageHTML).text('You booked this event');
                        $('.eventBtn', pageHTML).text('Unsubscribe');
                    }

                    $('.eventBtn', pageHTML).click(function(){
                        API.toggleBook(jsonData.data.event.id, jsonData.data.event.hasBooked)
                    });

                    var geoLink = 'https://maps.google.com?saddr=Current+Location&daddr=' + jsonData.data.event.places[0].latitude + ',' + jsonData.data.event.places[0].longitude;
                    $('.eventGuide', pageHTML).attr('href', geoLink);

                    newContainer.append(pageHTML);

                    break;
                }

                case 'restaurantSingle': {
                    var pageHTML = $.parseHTML(pageData);

                    $('.restaurantTitle', pageHTML).text(jsonData.name);
                    //immagine... ?
                    $('.restaurantPhone', pageHTML).append(' ' + jsonData.phone_number);
                    $('.restaurantPhone', pageHTML).attr('href', 'tel:' + jsonData.phone_number);

                    //MANCA LA DISTANZA E LA MAPPA!!!!!!!!!11!!!!!1!!!!1!!ù
                    
                    $('.restaurantDistance', pageHTML).text('a ' + jsonData.distance + ' m');

                    newContainer.append(pageHTML);

                    break;
                }

                case 'myProfile': {
                    var pageHTML = $.parseHTML(pageData);

                    $('.username', pageHTML).text(jsonData.data.user.name + ' ' + jsonData.data.user.surname);
                    newContainer.append(pageHTML);

                    break;
                }

                case 'myEvents': {
                    //var pageHTML = $.parseHTML(pageData);
                    //var baseEvent = $('.singleEvent', pageHTML)[0];
                    //$('.singleEvent', pageHTML).remove();
                    //newContainer.append(pageHTML);

                    //for (var i = 0; i < jsonData.data.length; i++) {

                    //    var newEvent = $(baseEvent).clone();
                    //    $(newEvent).attr('id', jsonData.data[i].id);
                    //    $('.eventType', newEvent).text(jsonData.data[i].type);
                    //    if (isset(jsonData.data[i].capacity))
                    //    $('.eventTitle', newEvent).text(jsonData.data[i].title);
                    //    var day = new Date(jsonData.data[i].date);
                    //    var dayText = getMonthName(day.getMonth()) + ' ' + day.getDate() + ' 11:10 A.M.';
                    //    $('.eventDate', newEvent).append(' ' + dayText);

                    //    newContainer.append(newEvent);
                    //}

                    jsonData.data.sort(sortMethods.date);

                    var pageHTML = $.parseHTML(pageData);
                    var baseEvent = $('.singleEvent', pageHTML)[0];
                    $('.singleEvent', pageHTML).remove();

                    newContainer.append(pageHTML);

                    var previousDay = new Date();
                    var dateTitle = null;
                    for (var i = 0; i < jsonData.data.length; i++) {
                        var newEvent = $(baseEvent).clone();

                        $(newEvent).attr('id', jsonData.data[i].id);
                        if (isset(jsonData.data[i].type) && jsonData.data[i].type !== 'null' && jsonData.data[i].type !== '')
                            $('.eventType', newEvent).text(jsonData.data[i].type);
                        else
                            $('.eventType', newEvent).remove();

                        if (jsonData.data[i].hasBooked) {
                            $('.eventSubs', newEvent).text('Booked!');
                        }
                        else {
                            if (isset(jsonData.data[i].capacity) && jsonData.data[i].capacity != 0)
                                $('.eventNum', newEvent).text('/' + jsonData.data[i].capacity);

                            $('.eventSubs', newEvent).prepend(jsonData.data[i].bookings);
                        }

                        $('.eventImg', newEvent).attr('src', jsonData.data[i].image);

                        $('.eventTitle', newEvent).text(jsonData.data[i].title);
                        var day = new Date(jsonData.data[i].date);
                        if (day.getDate() !== previousDay.getDate()) {
                            dateTitle = $('<h2></h2>').text((getMonthName(day.getMonth()) + ' ' + day.getDate()));
                            dateTitle.addClass('dateTitle');
                        } else
                            dateTitle = null;
                        var dayText = getMonthName(day.getMonth()) + ' ' + day.getDate() + ' - ' + jsonData.data[i].start.substr(0, 5);
                        $('.eventDate', newEvent).append(' ' + dayText);

                        if (isset(dateTitle))
                            newContainer.append(dateTitle);
                        newContainer.append(newEvent);

                        previousDay = day;

                    }

                    break;
                }

                case 'about': {
                    var pageHTML = $.parseHTML(pageData);

                    newContainer.append(pageHTML);
                }
            }

            currentContainer.replaceWith(newContainer);
            $('.loading').remove();

            if (noMenuLoaded)
                bindEvents();

            loadScript(pageName);
            slideout.enableTouch();

            currentPage = pageName;
            $('#logo, #menu, #panel').show();
        });
    }
};

function GetHourDiff(pStartHour, pEndHour) {
    var res = '';
    var aTmp='';
    //Trasformo l'orario di inizio in minuti
    aTmp=pStartHour.split(':');
    var nStartMin = (Number(aTmp[0]) * 60) + Number(aTmp[1]);
    //Trasformo l'orario di fine in minuti
    aTmp=pEndHour.split(':');
    var nEndMin = (Number(aTmp[0]) * 60) + Number(aTmp[1]);
    //Calcolo la differenza
    var nDiff = 0;
    if (nStartMin > nEndMin) {
        nDiff = nStartMin - nEndMin;
    } else {
        nDiff = nEndMin - nStartMin;
    }
    //Formatto la stringa di uscita
    var nDiffMin = 0;
    var nDiffHour  = 0;
    if (nDiff > 59) {
        nDiffMin = nDiff % 60;
        nDiffHour = (nDiff - nDiffMin) / 60;
    } else {
        nDiffMin = nDiff;
    }
    if (nDiffHour < 10) res += '0';
    res += nDiffHour;
    res += ':';
    if (nDiffMin < 10) res += '0';
    res += nDiffMin;
    return res;
}

function getMonthName(number) {
    switch (number) {
        case 0: {
            return 'January';
            break;
        }
        case 1: {
            return 'February';
            break;
        }
        case 2: {
            return 'March';
            break;
        }
        case 3: {
            return 'April';
            break;
        }
        case 4: {
            return 'May';
            break;
        }
        case 5: {
            return 'June';
            break;
        }
        case 6: {
            return 'July';
            break;
        }
        case 7: {
            return 'August';
            break;
        }
        case 8: {
            return 'September';
            break;
        }
        case 9: {
            return 'October';
            break;
        }
        case 10: {
            return 'November';
            break;
        }
        case 11: {
            return 'December';
            break;
        }
    }
}

var sortMethods = {
    'date': function (event1, event2) {
        var day1 = new Date(event1.date);
        var day2 = new Date(event2.date);

        if (day1 < day2)
            return -1;
        else if (day1 > day2)
            return 1;
        else {
            //TODO: controllo sull'ora
            return 0;
    }
}
};