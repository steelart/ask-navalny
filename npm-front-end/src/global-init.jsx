/*
Copyright 2017 Merkulov Alexey

The MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import { APP_CONFIG } from './config.jsx';

import { mainStore } from './main-reducer.jsx';

const $ = require('jquery');

var needRefresh = false;

function connectWebSocket() {
    window.timerId = null;
    var webSocket = new WebSocket('ws://' + window.location.host + '/hello/world');
    webSocket.onopen = function() {
        console.log('Connected!');
        mainStore.dispatch({ type: 'SET_WEB_SOCKET', socket : webSocket });
        clearTimeout(window.timerId);
        window.timerId = null;
    };

    webSocket.onmessage = function(message) {
        var data = JSON.parse(message.data);
        //console.log('Message: type=', data.type);
        mainStore.dispatch(data);
    };

    webSocket.onclose = function(event) {
        needRefresh = true;
        if (event.wasClean) {
            console.log('Connection closed correctly');
        } else {
            console.log('Some problem with server');
        }
        console.log('Code: ' + event.code + ' reason: ' + event.reason);
        if (!window.timerId)
           window.timerId = setTimeout(connectWebSocket, 5000); // TODO: timeout should be random
    };
    webSocket.onerror = function(error) {
        needRefresh = true;
        console.log('WebSocket error: ' + error.message);
        webSocket.close()
        if (!window.timerId)
           window.timerId = setTimeout(connectWebSocket, 5000); // TODO: timeout should be random
    };
}

console.log(window.global_preload_data);
mainStore.dispatch({ type : 'ADD_QUESTIONS', questions : window.global_preload_data.questions });

$(document).ready(function(){
    if (APP_CONFIG.web_sockets)
        connectWebSocket();
});
