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

var currentPage = 'index';
var pageNames = ['eventList', 'eventSingle', 'restaurantList', 'restaurantSingle'];
var menuHTML = '<header id="logo" class="fixed"> <i id="menu_btn" class="fa fa-bars"></i> <h2>Wikimania 2016</h2> </header> <nav id="menu"> <header id="navbar"> <ul class="navbar_list"> <li class="navbar_list_element"><i class="fa fa-user"></i><p class="navbar_text" id="eventSingle">Profile</p></li><li class="navbar_list_element"><i class="fa fa-calendar"></i><p class="navbar_text" id="eventList">Events</p></li><li class="navbar_list_element"><i class="fa fa fa-cutlery"></i><p class="navbar_text" id="restaurantList">Restaurants</p></li><li class="navbar_list_element"><i class="fa fa-sign-out"></i><p class="navbar_text">Log Out</p></li></ul> </header> </nav> <main id="panel"> <div class="container">';

function isset(variable) {
    return typeof (variable) != "undefined" && variable !== null;
}

function rebuildSlideout() {
    if ( isset(slideout) )
        slideout.destroy();

    slideout = new Slideout({
        'panel': document.getElementById('panel'),
        'menu': document.getElementById('menu'),
        'padding': vw * 50,
        'tolerance': vw * 10
    });

}

var vw = window.innerWidth / 100;
var slideout;

$(document).ready(function () {
    bindEvents();
});

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

            if ( noMenuLoaded )
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

            $.when($.ajax(name + '.html')).then(function (data, textStatus, jqXHR) {

                var dom = $.parseHTML(data);
                var content = $('.container', dom);

                newContainer.append(content.children().first());

                $.each(pageNames, function (index, data) {
                    unloadCss(data);
                });

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

function loadCss(name) {
    if (!$("link[href='css/" + name + ".css']").length)
        $('<link href="css/' + name + '.css" rel="stylesheet">').appendTo("head");
}

function unloadCss(name) {
    $("link[href='css/" + name + ".css']").remove();
}

function loadScript(name) {
    $.getScript('js/' + name + '.js');
}