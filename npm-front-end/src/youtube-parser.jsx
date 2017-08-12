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

import React from 'react';
import YouTube from 'react-youtube';

export default class YouTubeParser extends React.Component {
    render() {
        const video = this.search_youtube();
        return (
            <div>
                { video && this.render_youtube(video)}
            </div>
        );
    }
    search_youtube() {
        var video = null;
        video = this.search_youtube_prefix('https://youtu.be/');
        if (video) return video;
        video = this.search_youtube_prefix('https://www.youtube.com/watch?v=');
        if (video) return video;
        return null;
    }

    search_youtube_prefix(prefix) {
        const text = this.props.text;
        var start = text.indexOf(prefix);
        if (start == -1)
            return null;

        start += prefix.length;
        var video = null;
        for (var i = start; i < text.length; i++) {
            const c = text.charAt(i);
            if (!(c == '-' || c == '_' || ('a' <= c && c <= 'z')|| ('A' <= c && c <= 'Z')|| ('0' <= c && c <= '9'))) {
                return text.substring(start, i);
            }
        }
        return text.substr(start);
    }

    parse_time() { //TODO: it is almost stub!
        const text = this.props.text;
        var start = text.indexOf('t=');
        if (start == -1)
            return 0;
        var minutes = 0;
        var i = start + 2;
        for (; i < text.length; i++) {
            const c = text.charAt(i);
            if (!('0' <= c && c <= '9')) {
                break;
            } else {
                minutes = minutes*10 + (c - '0');
            }
        }
        if (text.charAt(i) != 'm')
            return 0;
        i++;
        var seconds = 0;
        for (; i < text.length; i++) {
            const c = text.charAt(i);
            if (!('0' <= c && c <= '9')) {
                break;
            } else {
                seconds = seconds*10 + (c - '0');
            }
        }
        if (text.charAt(i) != 's')
            return 0;
        return minutes*60 + seconds;
    }

    render_youtube(video) {
        const opts = {
            height: '390',
            width: '640',
            playerVars: { // https://developers.google.com/youtube/player_parameters
                start : this.parse_time(),
                autoplay: 0
            }
        };

        return <YouTube videoId={video} opts={opts} />;
    }
}