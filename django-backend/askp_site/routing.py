from channels.routing import route


channel_routing = {
    'websocket.connect': 'askp.consumers.ws_connect',
    'websocket.receive': 'askp.consumers.ws_message',
    'websocket.disconnect': 'askp.consumers.ws_disconnect'
}
