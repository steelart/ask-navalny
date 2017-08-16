import React from 'react';
import { connect } from 'react-redux';
import Linkify from 'react-linkify';

import { LinkButton, SimpleButton, RefButton, SimpleButtonLI, LinkButtonLI } from './buttons.jsx';
import { place_question } from './question.jsx';

import { api_connect, loadData } from './loading-api.jsx';
import { sdef, getSubmitFunction, LOADING_IN_PROCESS, LOADING_FAILED, LOADING_SUCCESSED } from './utils.jsx';

import { resetModalMode, dispatchModalMode } from './main-reducer.jsx'

import YouTube from 'react-youtube';

export class AnswerForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            player : null,
            full_len : 0,
            start : this.parse_time(this.props.answerText),
            end : 0,
            cur_time : 100,
            timer : null
        };
    }
    setAnswerText(text) {
        this.props.dispatch({
            type: 'SET_ANSWER_TEXT',
            text: text
        });
    }
    render() {
        const question_id = this.props.question_id;
        const answerText = this.props.answerText;
        const video_id = this.search_youtube(answerText);

        return <div>
            <h2>Предложите ваш ответ</h2>
            <input
                type="text"
                placeholder="youtube url"
                onChange={(event) => {
                    this.setAnswerText(event.target.value);
                    this.setState({start : this.parse_time(event.target.value)});
                }}
                value={answerText}
            />
            <br/>
            <button onClick={() => video_id &&
                this.props.submit(
                    'NEW_YOUTUBE_ANSWER',
                    { question_id: question_id, video_id : video_id, start : this.state.start, end : this.state.end },//TODO!
                    () => { this.setAnswerText(''); resetModalMode(this); }
                )
            }>Предложить ответ</button>
            { video_id && this.render_youtube(video_id) }
            <button onClick={() => resetModalMode(this)}>отмена</button>
        </div>;
    }

    update_time(player) {
        this.setState({cur_time : player.getCurrentTime()});
    }

    update_start_time(video, new_val) {
        this.setState({start : new_val});
        const p = {
            videoId : video,
            startSeconds : new_val,
            endSeconds : this.state.end
        };
        this.state.player.loadVideoById(p);
        clearTimeout(this.state.timer);
    }

    update_end_time(video, new_val) {
        this.setState({end : new_val});
        const p = {
            videoId : video,
            startSeconds : this.state.start,
            endSeconds : new_val
        };
        this.state.player.loadVideoById(p);
        clearTimeout(this.state.timer);
    }

    render_youtube(video) {
        const url_start = this.parse_time(this.props.answerText);
        const opts = {
            height: '390',
            width: '640',
            playerVars: { // https://developers.google.com/youtube/player_parameters
                start : url_start,
                autoplay: 0
            }
        };

        return <div>
            <br/>
            <YouTube
                videoId={video}
                opts={opts}
                onReady={(e) => {
                    this.setState({ player : e.target });
                    if (this.state.full_len == 0) {
                        const duration = e.target.getDuration();
                        this.setState({ full_len : duration, end : duration })
                    }
                }}
                onPlay={(e) => {
                    this.setState({ cur_time : e.target.getCurrentTime() });
                    this.setState({ timer : setInterval(() => this.update_time(e.target), 1000) });
                }}
            />
            <br/>
            <table border={0}>
              <tr>
                <th></th>
                <th><button onClick={() => this.update_start_time(video, this.state.cur_time)}>{this.state.cur_time}</button></th>
                <th></th>
                <th><button onClick={() => this.update_end_time(video, this.state.cur_time)}>{this.state.cur_time}</button></th>
              </tr>
              <tr>
                <th>С</th>
                <th><input
                    type='text'
                    value={this.state.start}
                    onChange={(e) => this.update_start_time(video, e.target.value)}
                /></th>
                <th>секунды по</th>
                <th><input
                    type='text'
                    value={this.state.end}
                    onChange={(e) => this.update_end_time(video, e.target.value)}
                /></th>
                <th>секунду</th>
              </tr>
            </table>
        </div>;
    }

    search_youtube(text) {
        var video = null;
        video = this.search_youtube_prefix(text, 'https://youtu.be/');
        if (video) return video;
        video = this.search_youtube_prefix(text, 'https://www.youtube.com/watch?v=');
        if (video) return video;
        return null;
    }

    search_youtube_prefix(text, prefix) {
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

    parse_time(text) { //TODO: it is almost stub!
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
        if (text.charAt(i) == 's') {
            return minutes;
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
}
