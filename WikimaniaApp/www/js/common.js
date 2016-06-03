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
var pageNames = ['eventList', 'eventSingle', 'restaurantList', 'restaurantSingle', 'accommodation', 'about'];
var menuHTML = '';
var userId;
var APIServerAddress = 'http://185.53.148.24/api/v1/';

$.when($.ajax('menu.html')).then(function (data, textStatus, jqXHR) {
    menuHTML = data;
});

function isset(variable) {
    return typeof (variable) != "undefined" && variable !== null;
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

var vw = window.innerWidth / 100;
var slideout;

function bindEvents() {
    $(document).on('backbutton', function () {
        if (document.referrer != 'index.html')
            location.href = document.referrer;
    })

    $('#menu_btn').off('touchstart');
    $('#menu_btn').on('touchstart', function () {
        slideout.toggle();
    });


    $(window).resize(function () {
        vw = window.innerWidth / 100;

        if (isset(slideout))
            rebuildSlideout();
    })

    $('.navbar_list_element p').off('touchstart');
    $('.navbar_list_element p').on('touchstart', function () {
        var id = $(this).attr('id');
        showPage(id);
    });
}

function showPage(name) {

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

                API[name](name, currentContainer, noMenuLoaded);

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

    login: function (id, autologin) {
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
                    if (!autologin)
                        alert("Server error. Please retry later.");
                },
                403: function () {
                    if (!autologin)
                        alert("Wrong code");
                }
            },
            success: function (msg) {
                that.token = msg.data['token'];
                store('userId', id);
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
                    if (!autologin)
                        alert("Server error. Please retry later.");
                },
            },
            success: function (data) {
                store('userId', '');
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
            },
            success: function (data) {
                API.show(pageName, data, currentContainer, noMenuLoaded);
            }
        });
    },

    show: function (pageName, jsonData, currentContainer, noMenuLoaded) {
        var newContainer = $('<div></div>');
        newContainer.addClass('container');

        //costruire l'html da inserire
        $.ajax(pageName + '.html').done(function (pageData) {

            switch (pageName) {
                case 'eventList': {

                    var pageHTML = $.parseHTML(pageData);
                    var baseEvent = $('.singleEvent', pageHTML)[0];
                    $('.singleEvent', pageHTML).remove();

                    

                    for (var i = 0; i < jsonData.data.length; i++)
                    {
                        var newEvent = $(baseEvent).clone();
                        
                        $(newEvent).attr('id', jsonData.data[i].id);
                        $('.eventType', newEvent).text(jsonData.data[i].type);
                        $('.eventNum', newEvent).text('/' + jsonData.data[i].capacity);
                        $('.eventSubs', newEvent).text(jsonData.data[i].bookings + $('.eventSubs', newEvent).text());
                        //immagine... ?
                        $('.eventTitle', newEvent).text(jsonData.data[i].title);
                        var day = new Date(jsonData.data[i].date);
                        var dayText = getMonthName(day.getMonth()) + ' ' + day.getDate() + ' 11:10 A.M.';
                        $('.eventDate', newEvent).text($('.eventDate', newEvent).text() + dayText);
                        newContainer.append(newEvent);
                    }

                    break;
                }
            }

            currentContainer.replaceWith(newContainer);
            $('.loading').remove();

            if (noMenuLoaded)
                bindEvents();

            loadScript(pageName);
            slideout.enableTouch();
            currentPage = name;
            $('#logo, #menu, #panel').show();
        });
    },

    buildPage: function (baseHTML) {

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