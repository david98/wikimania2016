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

userId = getFromStorage('userToken');
sendId(userId, true);

$(document).ready(function () {
    button = $('#button');
    idCode = $('#idCode');
    form = $('#form');
    logo = $('#logo');
    title = $('#title');

    button.click(visualizza);
    form.submit(function (event) {
        event.preventDefault();
    });
});

function visualizza() {
    logo.css('transform', 'translateY(-12vh)');
    title.css('transform', 'translateY(15vh)');

    button.val('Sign in');
    button.css('width', '40vmin');
    button.css('transform', 'translateY(-20vh)');
    button.bind('touchstart', login);

    form.css('visibility', 'visible');
    form.css('opacity', '1');

    button.off('click');
    button.click(login);
}

function login(){
    var userId = idCode.val();

    sendId(userId);
}

function sendId(id, autologin) {

    var data = {
        key: id
    };

    $.ajax({
        url: APIServerAddress + 'login',
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        async: false,
        statusCode: {
            400: function () {
                if( !autologin )
                    alert("Server error. Please retry later.");
            },
            403: function () {
                if( !autologin )
                    alert("Wrong code");
            }
        },
        success: function (msg) {
            userToken = msg.data['token'];
            store('userId', id);
            showPage('eventList');
        }
    });
}