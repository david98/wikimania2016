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

var currentPage = 'index';
var pageNames = ['eventList', 'eventSingle', 'restaurantList', 'restaurantSingle'];

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

rebuildSlideout();

$(document).ready(function () {
    
    bindEvents();

});

function bindEvents() {
    $(document).on('backbutton', function () {
        if (document.referrer != 'index.html')
            location.href = document.referrer;
    })

    $('#menu_btn').on('touchstart', function () {
        slideout.toggle();
    }
    );


    $(window).resize(function () {
        vw = window.innerWidth / 100;

        rebuildSlideout();
    })

    $('.navbar_list_element p').on('touchstart', function () {
        var id = $(this).attr('id');
        alert(id);
        //showPage(id);
    });
}

function showPage(name) {
    var noMenuLoaded = false;
    var currentContainer;

    if (currentPage === 'index')
        noMenuLoaded = true;
    else
        currentContainer = $('.container');

    $.get('loading.html', function (data) {
        var dom = $.parseHTML(data);
        loadCss('loading');

        if ( noMenuLoaded )
            $('body').html(dom);
        else
            currentContainer.html(dom);
            
    });

    if (noMenuLoaded) {
        $('body').prepend('<header id="logo" class="fixed"> <i id="menu_btn" class="fa fa-bars"></i> <h2>Wikimania 2016</h2> </header> <nav id="menu"> <header id="navbar"> <ul class="navbar_list"> <li class="navbar_list_element"><i class="fa fa-user"></i><p class="navbar_text">Profile</p></li><li class="navbar_list_element"><i class="fa fa-calendar"></i><p class="navbar_text">Events</p></li><li class="navbar_list_element"><i class="fa fa fa-cutlery"></i><p class="navbar_text">Restaurants</p></li><li class="navbar_list_element"><i class="fa fa-sign-out"></i><p class="navbar_text">Log Out</p></li></ul> </header> </nav> <main id="panel"> <div class="container">');
        currentContainer = $('.container');
    }

    var newContainer = $(document.createElement('div'));
    newContainer.addClass('container');

    $.when($.ajax(name + '.html')).then(function (data, textStatus, jqXHR) {

        var dom = $.parseHTML(data);
        var content = $('.container', dom);

        $.each(content.children(), function (index, data) {
            newContainer.append(data);
        })

        $.each(pageNames, function (index, data) {
            unloadCss(data);
        })

        if (noMenuLoaded) {
            //rebuildSlideout();
            //slideout.disableTouch();
            unloadCss('index');
            loadCss('common');
            loadCss('font-awesome/css/font-awesome.min');
        }

        loadCss(name);

        currentContainer.replaceWith(newContainer);
        //alert(newContainer.html());
        $('.loading').remove();
        bindEvents();
        loadScript(name);
        slideout.enableTouch();
        currentPage = name;
    });
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