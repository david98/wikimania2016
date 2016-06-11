﻿/*
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
var pageNames = ['eventList', 'eventSingle', 'restaurantList', 'restaurantSingle', 'accommodation', 'about'];
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
    });

    $(document).on('popstate', previousPage);

    $('body').on('click', '.eventImg, .eventTitle', function (event) {
        showPage('eventSingle', $(event.target).parent().attr('id'));
    });

    $('body').on('click', '.restaurantImg, .eventTitle', function (event) {
        showPage('restaurantSingle', $(event.target).parent().attr('id'));
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
parameters è un oggetto contenente dati richiesti per la visualizzazione della pagina name
*/
function showPage(name, parameters) 
{
    if (name !== currentPage) {

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

function loadExternalScript(URL) {
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

    login: function (id) {
        var data = {
            key: id
        };
        var that = this;

        $.ajax({
            url: APIServerAddress + 'login',
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
            url: APIServerAddress + 'logout',
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
                window.location.reload();
            }
        });
    },

    eventList: function (pageName, currentContainer, noMenuLoaded) {
        var that = this;
        $.ajax({
            url: APIServerAddress + 'events',
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
            url: APIServerAddress + 'restaurants',
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
            url: APIServerAddress + 'event/' + idEvent,
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
                API.show(pageName, data, currentContainer, noMenuLoaded, idEvent);
            }
        });
    },

    restaurantSingle: function (pageName, currentContainer, noMenuLoaded, data) {
               API.show(pageName, data, currentContainer, noMenuLoaded, parameters);
    },

    show: function (pageName, jsonData, currentContainer, noMenuLoaded, itemId) {
        var newContainer = $('<div></div>');
        newContainer.addClass('container');

        //costruire l'html da inserire
        $.ajax(pageName + '.html').done(function (pageData) {

            switch (pageName) {
                case 'eventList': {

                    var pageHTML = $.parseHTML(pageData);
                    var baseEvent = $('.singleEvent', pageHTML)[0];
                    $('.singleEvent', pageHTML).remove();

                    newContainer.append(pageHTML);

                    for (var i = 0; i < jsonData.data.length; i++)
                    {
                        var newEvent = $(baseEvent).clone();
                        
                        $(newEvent).attr('id', jsonData.data[i].id);
                        $('.eventType', newEvent).text(jsonData.data[i].type);
                        if (isset(jsonData.data[i].capacity) )
                            $('.eventNum', newEvent).text('/' + jsonData.data[i].capacity);
                        $('.eventSubs', newEvent).prepend(jsonData.data[i].bookings);
                        //immagine... ?
                        $('.eventTitle', newEvent).text(jsonData.data[i].title);
                        var day = new Date(jsonData.data[i].date);
                        var dayText = getMonthName(day.getMonth()) + ' ' + day.getDate() + ' 11:10 A.M.';
                        $('.eventDate', newEvent).append(' ' + dayText);

                        newContainer.append(newEvent);
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

                    $('.eventNum', pageHTML).text(jsonData.data.event.capacity - jsonData.data.event.bookings + ' seats left!');

                    newContainer.append(pageHTML);

                    break;
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