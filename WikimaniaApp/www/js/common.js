/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
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
    });

    $('body').on('touchstart', '.navbar_list_element p', function (event) {
        showPage(event.target.id);
        slideout.close();
    });

    $('body').on('click', '.restaurantImg', function (event) {
        showPage('restaurantSingle', {
            "name": $(event.target).parent().attr('data-name'),
            "address": $(event.target).parent().attr('data-address'),
            "latitude": $(event.target).parent().attr('data-latitude'),
            "longitude": $(event.target).parent().attr('data-longitude'),
            "phone_number": $(event.target).parent().attr('data-phone_number')
        });
    });

    $('body').on('click', '.restaurantTitle', function (event) {
        showPage('restaurantSingle', {
            "name": $(event.target).parent().parent().attr('data-name'),
            "address": $(event.target).parent().parent().attr('data-address'),
            "latitude": $(event.target).parent().parent().attr('data-latitude'),
            "longitude": $(event.target).parent().parent().attr('data-longitude'),
            "phone_number": $(event.target).parent().parent().attr('data-phone_number')
        });
    });

    $('body').on('touchstart', '.buttonEvents', function () {
        showPage('myEvents');
    });

    $(document).on('popstate', previousPage);

    $('body').on('click', '.eventImg, .eventTitle', function (event) {
        showPage('eventSingle', $(event.target).parent().attr('id'));
    });

    $('body').on('click', '.eventTitle', function (event) {
        showPage('eventSingle', $(event.target).parent().parent().attr('id'));
    });

    $(document).on('deviceready', function () {
        document.addEventListener('backbutton', goBack, false);
    });
});

$.when($.ajax('menu.html')).then(function (data, textStatus, jqXHR) {
    menuHTML = data;
});

function isset(variable) {
    return typeof (variable) != "undefined" && variable !== null;
}

function goBack(event) {
    history.back();
}

function previousPage(event) {
    console.log(event.state.name);
    if( isset(event.state.name) && isset(event.state.parameters) )
        showPage(event.state.name, event.state.parameters);
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

/*
TODO: calcola la distanza tra a e b, dove a e b sono oggetti {lon: , lat: }
*/
function distanceBetween(a, b) {

}

/*
parameters è un oggetto contenente dati richiesti per la visualizzazione della pagina name
*/
function showPage(name, parameters){ 
    if (name !== currentPage) {

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
                    currentContainer = $('.container');
                    $('#logo, #menu, #panel').hide();
                }

                API[name](name, currentContainer, noMenuLoaded, parameters);

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

                historyItem = {
                    name: name,
                    parameters: parameters
                };

                history.pushState(historyItem, name, name + '.html');
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

function loadExternalScript(URL) {APIServerAddress
    return $.getScript(URL);
}

function store(name, value) {
    if (typeof (Storage) !== "undefined") {
        // Code for localStorage/sessionStorage.
        localStorage.setItem(name, value);
        return true;
    } else {
        // Sorry! No Web Storage support..
    }
}

function getFromStorage(name) {
    if (typeof (Storage) !== "undefined") {
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
            async: true,
            statusCode: {
                400: function () {
                    alert("Server error. Please retry later.");
                },
                403: function () {
                    alert("Wrong code");
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
        var that = this;
        $.ajax({
            url: this.serverAddress + 'logout',
            type: 'GET',
            async: true,
            dataType: 'json',
            headers: {
                'X-Auth-Token': that.token
            },
            statusCode: {
                400: function () {
                    alert("Server error. Please retry later.");
                },
            },
            success: function (data) {
                store('userToken', '');
                var historyItem = {
                    name: 'index',
                    parameters: null
                };
                history.replaceState(null, 'index', 'index.html');
                window.location.reload();
            }
        });
    },

    eventList: function (pageName, currentContainer, noMenuLoaded) {
        var that = this;
        $.ajax({
            url: this.serverAddress + 'events',
            type: 'GET',
            async: true,
            dataType: 'json',
            headers: {
                'X-Auth-Token': that.token
            },
            statusCode: {
                400: function () {
                    alert("Server error. Please retry later.");
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
            async: true,
            dataType: 'json',
            headers: {
                'X-Auth-Token': that.token
            },
            statusCode: {
                400: function () {
                    alert("Server error. Please retry later.");
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
            async: true,
            dataType: 'json',
            headers: {
                'X-Auth-Token': that.token
            },
            statusCode: {
                400: function () {
                    alert("Server error. Please retry later.");
                },
            },
            success: function (data) {
                API.show(pageName, data, currentContainer, noMenuLoaded);
            }
        });
    },

    myProfile: function (pageName, currentContainer, noMenuLoaded) {
        var that = this;
        $.ajax({
            url: this.serverAddress + 'profile',
            type: 'GET',
            async: true,
            dataType: 'json',
            headers: {
                'X-Auth-Token': that.token
            },
            statusCode: {
                400: function () {
                    alert("Server error. Please retry later.");
                },
            },

            success: function (data) {
                API.show(pageName, data, currentContainer, noMenuLoaded);
            }
        });
    },

    myEvents: function (pageName, currentContainer, noMenuLoaded) {
        var that = this;
        $.ajax({
            url: this.serverAddress + 'events/booked',
            type: 'GET',
            async: true,
            dataType: 'json',
            headers: {
                'X-Auth-Token': that.token
            },
            statusCode: {
                400: function () {
                    alert("Server error. Please retry later.");
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

    toggleBook: function (event) {
        var that = this;
        var id = event.data.id;
        var hasBooked = event.data.hasBooked;

        if (!hasBooked) {
            $.ajax({
                url: this.serverAddress + 'event/' + id + '/book',
                type: 'POST',
                async: true,
                dataType: 'json',
                headers: {
                    'X-Auth-Token': that.token
                },
                statusCode: {
                    400: function () {
                        alert("Server error. Please retry later.");
                    },
                },

                success: function (data) {
                    alert("Successfully subscribed!")
                    showPage("eventSingle",id);
                }
            });
        }
        else
        {
            $.ajax({
                url: this.serverAddress + 'event/' + id + '/unbook',
                type: 'DELETE',
                async: true,
                dataType: 'json',
                headers: {
                    'X-Auth-Token': that.token
                },
                statusCode: {
                    400: function () {
                        alert("Server error. Please retry later.");
                    },
                },

                success: function (data) {
                    alert("Successfully unsubscribed!")
                    showPage("eventSingle", id);
                }
            });
        }
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

                    var previousDay = new Date();
                    var dateTitle = null;
                    for (var i = 0; i < jsonData.data.length; i++)
                    {
                        var newEvent = $(baseEvent).clone();
                        
                        $(newEvent).attr('id', jsonData.data[i].id);
                        if (isset(jsonData.data[i].type) && jsonData.data[i].type !== "null" && jsonData.data[i].type !== "")
                            $('.eventType', newEvent).text(jsonData.data[i].type);
                        else
                            $('.eventType', newEvent).remove();

                        if (jsonData.data[i].hasBooked) {
                            $('.eventSubs', newEvent).text("Booked!");
                        }
                        else
                        {
                            if (isset(jsonData.data[i].capacity) && jsonData.data[i].capacity != 0 )
                                $('.eventNum', newEvent).text('/' + jsonData.data[i].capacity);

                        $('.eventSubs', newEvent).prepend(jsonData.data[i].bookings);
                        }

                        //immagine... ?
                        $('.eventTitle', newEvent).text(jsonData.data[i].title);
                        var day = new Date(jsonData.data[i].date);
                        if (day.getDate() !== previousDay.getDate()) {
                            dateTitle = $('<h2></h2>').text((getMonthName(day.getMonth()) + ' ' + day.getDate()));
                            dateTitle.addClass('dateTitle');
                        } else
                            dateTitle = null;
                        var dayText = getMonthName(day.getMonth()) + ' ' + day.getDate() + ' ' + jsonData.data[i].start.substr(0,5);
                        $('.eventDate', newEvent).append(' ' + dayText);

                        if (isset(dateTitle))
                            newContainer.append(dateTitle);
                        newContainer.append(newEvent);

                        previousDay = day;

                    }

                    break;
                }

                case 'restaurantList': {
                    var pageHTML = $.parseHTML(pageData);
                    var baseRestaurant = $('.singleRestaurant', pageHTML)[0];
                    $('.singleRestaurant', pageHTML).remove();

                    newContainer.append(pageHTML);

                    for (var i = 0; i < jsonData.data.length; i++) {
                        var newRestaurant = $(baseRestaurant).clone();

                        //immagine... ?
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


                        //var geolocation = new ol.Geolocation({
                            // take the projection to use from the map's view
                            //projection: view.getProjection()
                        //});
                        // listen to changes in position
                        //geolocation.on('change', function (evt) {
                            //window.console.log(geolocation.getPosition());
                        //});


                        //var myPosition = 
                        //var myDestination =
                        //var distance = 
                        //$('.restaurantDistance', newRestaurant).text(distance + ' km');

                        newContainer.append(newRestaurant);
                    }
                    break;
                }

                case 'eventSingle': {
                    var pageHTML = $.parseHTML(pageData);

    
                    $(pageHTML).attr('id', jsonData.data.event.id);
                    $('.eventTitle', pageHTML).text(jsonData.data.event.title);
                    //immagine... ?
                    var day = new Date(jsonData.data.event.date);
                    var dayText = getMonthName(day.getMonth()) + ' ' + day.getDate() + ' 11:10 A.M.';
                    $('.eventDate', pageHTML).append(' ' + dayText);

                    if (!jsonData.data.event.hasBooked) {
                    $('.eventNum', pageHTML).text(jsonData.data.event.capacity - jsonData.data.event.bookings + ' seats left!');
                        $('.eventBtn', pageHTML).text("Subscribe");
                    }
                    else
                    {
                        $('.eventNum', pageHTML).text("You booked this event");
                        $('.eventBtn', pageHTML).text("Unsubscribe");
                    }

                    $('.eventBtn', pageHTML).click({ id: jsonData.data.event.id, hasBooked: jsonData.data.event.hasBooked }, API.toggleBook)

                    $('.eventGuide', pageHTML).attr('href', 'geo:');

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

                    newContainer.append(pageHTML);

                    break;
                }

                case 'myProfile': {
                    var pageHTML = $.parseHTML(pageData);

                    $('.username', pageHTML).text(jsonData.data.user.name + " " + jsonData.data.user.surname);
                    newContainer.append(pageHTML);

                    break;
                }

                case 'myEvents': {
                    var pageHTML = $.parseHTML(pageData);
                    var baseEvent = $('.singleEvent', pageHTML)[0];
                    $('.singleEvent', pageHTML).remove();
                    newContainer.append(pageHTML);

                    for (var i = 0; i < jsonData.data.length; i++) {

                        var newEvent = $(baseEvent).clone();
                        $(newEvent).attr('id', jsonData.data[i].id);
                        $('.eventType', newEvent).text(jsonData.data[i].type);
                        if (isset(jsonData.data[i].capacity))
                        $('.eventTitle', newEvent).text(jsonData.data[i].title);
                        var day = new Date(jsonData.data[i].date);
                        var dayText = getMonthName(day.getMonth()) + ' ' + day.getDate() + ' 11:10 A.M.';
                        $('.eventDate', newEvent).append(' ' + dayText);

                        newContainer.append(newEvent);
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

/*
function showPage(name) {

    if (name === "logout")
        API.logout();
    else if (name !== currentPage) {

        var noMenuLoaded = false;
        var currentContainer;

        if (currentPage === 'index')
            noMenuLoaded = true;
        else
            currentContainer = $('.container');

        if (!noMenuLoaded)
            slideout.close();

        $.when(
            $.ajax('loading.html').then(function (data, textStatus, jqXHR) {

                loadCss('loading');

                if (noMenuLoaded)
                    $('body').html(data);
                else
                    currentContainer.html(data);

                if (noMenuLoaded) {
                    $('body').prepend(menuHTML);
                    currentContainer = $('.container');
                    $('#logo, #menu, #panel').hide();
                }

                var newContainer = $('<div></div>');
                newContainer.addClass('container');


                //sostituire la chiamata AJAX con un caricamento dei dati da API
                $.when($.ajax(name + '.html')).then(function (data, textStatus, jqXHR) {

                    /*var dom = $.parseHTML(data);
                    var content = $('.container', dom);
    
    
                    $.each(content.children(), function (index, data) {
                        newContainer.append(data);
                    });*//*

newContainer.html(data);

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

currentContainer.replaceWith(newContainer);
$('.loading').remove();

if (noMenuLoaded)
    bindEvents();

loadScript(name);
slideout.enableTouch();
currentPage = name;
$('#logo, #menu, #panel').show();
});
})
        );
}
}
*/