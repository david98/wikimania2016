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
document.getElementById("button").addEventListener("click", visualizza);
document.getElementById("polpetta").addEventListener("submit", login);

function visualizza() {
    document.getElementById("logo").style.transform='translateY(-12vh)';
    
    document.getElementById("title").style.transform='translateY(15vh)';

    document.getElementById("button").value='Sign in';
    document.getElementById("button").style.width='40vmin';
    document.getElementById("button").style.transform='translateY(-20vh)';
    document.getElementById("button").addEventListener("click", login);

    document.getElementById("form").style.visibility='visible';
    document.getElementById("form").style.opacity='1';
}

function login(){
    var txt = document.getElementById("polpetta").value;
    alert(txt);
    location.href = 'eventList.html';
}