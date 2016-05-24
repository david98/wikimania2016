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

var vw = window.innerWidth / 100;

$(window).resize(function () {
    vw = window.innerWidth / 100;
    slideout.destroy();
    slideout = new Slideout({
        'panel': document.getElementById('panel'),
        'menu': document.getElementById('menu'),
        'padding': vw * 30,
        'tolerance': vw * 10
    });
})

var slideout = new Slideout({
    'panel': document.getElementById('panel'),
    'menu': document.getElementById('menu'),
    'padding': vw*30,
    'tolerance': vw*10
});

$(document).ready(function () {
    $('#menu_btn').bind('touchstart', function () {
            slideout.toggle();
        }
    );


});

$(document).bind('backbutton', function () {
    if (document.referrer != 'index.html')
        location.href = document.referrer;
})