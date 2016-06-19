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

var button, idCode, form, logo, title;

$(document).ready(function () {

    userToken = getFromStorage('userToken');
    if (userToken !== '' && isset(userToken)) {
        API.token = userToken;
        showPage('eventList');
    } 

    button = $('#button');
    buttonGuest = $('#button_guest');
    idCode = $('#idCode');
    form = $('#form');
    logo = $('#logo');
    title = $('#title');

    button.on('click', visualizza);
    form.submit(function (event) {
        event.preventDefault();
    });

    buttonGuest.on('click', function () {
        login("volontario", false);
    });

    idCode.on('focusin', function () {

        buttonGuest.fadeOut(300);

    });

    idCode.on('focusout', function () {
        buttonGuest.fadeIn(300);

    });
});

function visualizza() {
    logo.css('transform', 'translateY(-12vh)');
    title.css('transform', 'translateY(15vh)');

    button.val('Sign in');
    button.css('width', '40vmin');
    button.css('transform', 'translateY(-20vh)');

    button.off('touchstart');
    button.on('touchstart', function () {
        login(idCode.val(), false);
    });

    form.css('visibility', 'visible');
    form.css('opacity', '1');
}

function login(userId, autologin) {

    var isValidId = true;
    /*controlli sull'userId*/


    if (isValidId)
        API.login(userId, autologin);
    else if( !autologin )
        alert("Invalid code.");
}