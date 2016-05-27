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
var pageNames = ['eventList', 'eventSingle', 'restaurantList', 'restaurantSingle', 'accommodation'];
var menuHTML = '';

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
            'padding': vw * 50,
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


                $.each(content.children(), function (index, data) {
                    newContainer.append(data);
                });

                for(var i = 0; i < pageNames.length; i++ )
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