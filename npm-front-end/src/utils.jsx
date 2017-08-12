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

export const LOADING_IN_PROCESS = 1;
export const LOADING_FAILED = 2;
export const LOADING_SUCCESSED = 3;

import { post_api } from './loading-api.jsx';


//set def
export function sdef(set) {
    return set ? set : {};
}

var sdef_deep_value = function(obj, path){
    for (var i = 0; i < path.length; i++){
        obj = sdef(obj)[path[i]];
    };
    return obj;
};


export function fld_ar(set, path, val) {
    var prev_path = [...path];
    var new_val = val;
    for (var i = path.length - 1; i >= 0; i--) {
        prev_path.pop();
        var res_set = {...sdef(sdef_deep_value(set, prev_path))};
        res_set[path[i]] = new_val;
        new_val = res_set;
      }
    return new_val;
}

export function fld(set, field, val) {
    if (field instanceof Array) {
        return fld_ar(set, field, val);
    }
    //return fld_ar(set, field.split('.'), val);
    var res = {...set};
    res[field] = val;
    return res;
}


export function getArrayOfKeys(obj) {
    var res = [];
    for (var p in obj) {
        res.push(p);
    }
    return res;
}

export function getSubmitFunction(state) {
    return (action, input, callback) => post_api(
        '/api/post-api',
        {action : action, ...input},
        (data) => data.success ? ( callback && callback(data) ) : console.log('Bad answer from post-api', data));
    //return (action, data) => state.webSocket.send(JSON.stringify({action : action, ...data}));
}

export function queryStringEncoding(obj) {
  var str = [];
  for(var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
}
