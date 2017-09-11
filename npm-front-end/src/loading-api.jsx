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

import { UNINITED_LOADED_DATA } from './main-reducer.jsx';

const $ = require('jquery');


var loadingMap = {};

export function loadData(path, action_type, dispatch, params = {}, callback = null) {
    if (loadingMap[action_type]) {
        console.log('double load from: ' + path, loadingMap);
        return;
    }
    //dispatch({type: action_type, result: UNINITED_LOADED_DATA, ...params });
    //console.log('load from: ' + path);
    loadingMap[action_type] = true;
    $.get( path, function( data ) {
       loadingMap[action_type] = false;
       console.log('loaded from: ', path, ' action type: ', action_type, ' data:', data);
       dispatch({type: action_type, result: { data: data, inited: true, success: true }, ...params});
       if (callback) callback(data);
    }).fail(function( data ) {
       loadingMap[action_type] = false;
       dispatch({type: action_type, result: { data: null, inited: true, success: false}, ...params });
       console.log("Fail to load data");
    });
}


export function api_connect(api_path, action_type, base_name) {
    return class extends base_name {
        componentDidMount() {
            this.props.dispatch({type: action_type, result: UNINITED_LOADED_DATA });
            //console.log('api_connect ' + api_path, this.props);
            if (this.props.params.id)
                loadData(api_path + this.props.params.id, action_type, this.props.dispatch);
        }
    };
}

export function post_api(api_path, data, callback) {
    $.post(api_path, data, callback).fail(() => console.log('Failed post request ' + api_path));
}
