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
import { connect } from 'react-redux';
import Linkify from 'react-linkify';

import { LinkButton, SimpleButton, RefButton, SimpleButtonLI, LinkButtonLI } from './buttons.jsx';
import { place_question } from './question.jsx';

import { api_connect, loadData } from './loading-api.jsx';
import { sdef, getSubmitFunction, LOADING_IN_PROCESS, LOADING_FAILED, LOADING_SUCCESSED } from './utils.jsx';

import { resetModalMode, dispatchModalMode } from './main-reducer.jsx'
import { setLoginModalMode } from './login-page.jsx';

import { AnswerForm } from './answer-form.jsx';

import YouTube from 'react-youtube';

class Answer extends React.Component {
    button(action, name, field, choosedStyle) {
        const data = this.props.data;
        return <SimpleButtonLI
                baseStyle={data[field] ? choosedStyle : 'linkButtonStyle'}
                onClick={() => this.props.idInfo.logged_in
                    ? this.props.submit(action, {'id' : data.id}, () =>
                        this.props.dispatch({type : action, answer: data.id}))
                    : setLoginModalMode(this)
                }>
            {name}
        </SimpleButtonLI>;
    }

    render() {
        const data = this.props.data;

        const opts = {
            height: '390',
            width: '640',
            playerVars: { // https://developers.google.com/youtube/player_parameters
                start : data.start,
                end : data.end,
                autoplay: 0
            }
        };
        return <div className={this.props.choosedAnswer ? 'choosedAnswer' : 'answerInList'}>
            { this.button('LIKE_ANSWER', data.like_number + '+', 'like', 'votedQuestion') }
            { this.button('DISLIKE_ANSWER', data.dislike_number + '-', 'dislike', 'complainedQuestion') }
            <span>{data.submit_date}</span>
            { this.props.idInfo.permissions.choose_answer && this.button('CHOOSE_ANSWER', 'Выбрать ответ') }
            <YouTube
                videoId={data.video_id}
                opts={opts}
            />
        </div>;
    }
}

class QuestionPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            answer_num : 0
        };
    }
    render() {
        const question_id = this.props.params.id;
        const questionsInfo = this.props.questionsInfo;
        const answers = questionsInfo.answers_map[question_id];
        const question = questionsInfo.questions[question_id];

        const ConnectedAnswerForm = connect((state, props) => ({
                question_id : question_id,
                idInfo : state.idInfo,
                answerText : state.answerText,
                submit : getSubmitFunction(state)
            }))(AnswerForm);

        if (!answers) {
            loadData('/api/answers/' + question_id, 'SET_ANSWERS', this.props.dispatch, {question_id : question_id});
            return <div>
                <p> Идёт загрузка ответов </p>
            </div>;
        } else {
            const official_answer_id = question.official_answer;
            const asfn = (n) => answers[Object.keys(answers)[n]];
            const cur_num = this.state.answer_num;
            const answer = asfn(cur_num);
            const answers_size = Object.keys(answers).length;
            return <div>
                { place_question(this.props, questionsInfo.questions, question_id, false) }
                <button onClick={() => this.props.idInfo.logged_in
                    ? dispatchModalMode(this, ConnectedAnswerForm)
                    : setLoginModalMode(this)
                }>Предложить ответ</button>
                <br/>
                { answers_size != 0 && <button onClick={() => asfn(cur_num - 1) && this.setState({answer_num : cur_num - 1})}>{'<'}</button> }
                { answers_size != 0 && <span>Ответ {cur_num+1}/{answers_size}</span>}
                { answers_size != 0 && <button onClick={() => asfn(cur_num + 1) && this.setState({answer_num : cur_num + 1})}>{'>'}</button> }
                { answer && <Answer
                    submit={this.props.submit}
                    idInfo={this.props.idInfo}
                    data={answer}
                    dispatch={this.props.dispatch}
                    choosedAnswer={answer.id == official_answer_id}
                /> }
                { answers_size == 0 && <p>Ещё нет ни одного ответа</p>}
            </div>;
        }
    }
}

export const ConnectedQuestionPage = connect((state, props) => ({
        idInfo : state.idInfo,
        answerText : state.answerText,
        questionsInfo : state.questionsInfo,
        submit : getSubmitFunction(state)
    }))(QuestionPage);
