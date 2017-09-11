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

import YouTube from 'react-youtube';


import { Button } from 'reactstrap';

import { place_question } from './question.jsx';

import { api_connect, loadData } from './loading-api.jsx';
import { sdef, getSubmitFunction, LOADING_IN_PROCESS, LOADING_FAILED, LOADING_SUCCESSED } from './utils.jsx';

import { resetModalMode, dispatchModalMode } from './main-reducer.jsx'
import { setLoginModalMode } from './login-page.jsx';

import { AnswerForm } from './answer-form.jsx';

import { APPROVED, REJECTED, UNDECIDED, ANSWERED } from './utils.jsx';


class Answer extends React.Component {
    button(action, name, field, choosedStyle) {
        const data = this.props.data;
        return (
            <Button outline color="primary" size='lg'
                onClick={() => this.props.idInfo.logged_in
                    ? this.props.submit(action, {'id' : data.id}, () =>
                        this.props.dispatch({type : action, answer: data.id}))
                    : setLoginModalMode(this)
                }>
                {name}
            </Button>
        );
    }

    render() {
        const data = this.props.data;
        const rejected = data.status == REJECTED;
        const approved = data.status == APPROVED;
        const undecided = data.status == UNDECIDED;
        const is_moderator = this.props.idInfo.is_moderator;

        const opts = {
            height: '390',
            width: '640',
            playerVars: { // https://developers.google.com/youtube/player_parameters
                start : data.start,
                end : data.end,
                autoplay: 0
            }
        };
        return <div className={'answerInList'}>
            { this.button('LIKE_ANSWER', data.like_number + '+', 'like', 'votedQuestion') }
            { this.button('DISLIKE_ANSWER', data.dislike_number + '-', 'dislike', 'complainedQuestion') }
            <span>{data.submit_date}</span>
            { is_moderator && !approved && this.button('APPROVE_ANSWER', 'Одобрить ответ') }
            { is_moderator && !rejected && this.button('REJECT_ANSWER', 'Заблокировать ответ') }
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
            // Use id instead of local index because the index could change in other session
            answer_id : null
        };
    }

    compareAnswers(answers, id1, id2) {
        const a1 = answers[id1];
        const a2 = answers[id2];
        if (a1.position != 0 && a2.position != 0) {
            return a1.position - a2.position;
        }
        if (a1.position != 0) return -1;
        if (a2.position != 0) return  1;
        // TODO: First we need show undecided, then rejected
        if (a1.submit_date < a2.submit_date) return -1;
        if (a1.submit_date > a2.submit_date) return  1;
        return id1 - id2;
    }

    getAnswersOrder(answers) {
        var keys = [...Object.keys(answers)];
        keys.sort((id1, id2) => this.compareAnswers(answers, id1, id2));
        return keys;
    }

    render() {
        const question_id = this.props.params.id;
        const questionsInfo = this.props.questionsInfo;
        const answers = questionsInfo.answers_map[question_id];
        const question = questionsInfo.questions[question_id];
        const is_moderator = this.props.idInfo.is_moderator;

        const ConnectedAnswerForm = connect((state, props) => ({
                question_id : question_id,
                idInfo : state.idInfo,
                answerText : state.answerText,
                submit : getSubmitFunction(state)
            }))(AnswerForm);

        if (!answers) {
            loadData(
                '/api/answers/' + question_id,
                'SET_ANSWERS',
                this.props.dispatch,
                {question_id : question_id},
                (data) => this.setState({answer_id : this.getAnswersOrder(data.answers)[0]}));
            return <div>
                <p> Идёт загрузка ответов </p>
            </div>;
        } else {
            const keys = this.getAnswersOrder(answers);
            const answers_size = keys.length;
            const asfn = (n) => answers[keys[n]];
            const cur_num = keys.indexOf(keys.find((id) => id == this.state.answer_id));
            const answer = asfn(cur_num);

            const approved = answer && answer.status == APPROVED;

            return (
                <div>
                { place_question(this.props, questionsInfo.questions, question_id, false) }
                <br/>
                <div className="flex-center">
                    <Button outline color="primary"
                        onClick={() => this.props.idInfo.logged_in
                            ? dispatchModalMode(this, ConnectedAnswerForm)
                            : setLoginModalMode(this)
                        }>
                        Предложить ответ
                    </Button>
                </div>
                <br/>
                { answers_size != 0 && <button onClick={() => asfn(cur_num - 1) && this.setState({answer_id : keys[cur_num - 1]})}>{'<'}</button> }
                { answers_size != 0 && <span>Ответ {cur_num+1}/{answers_size}</span>}
                { answers_size != 0 && <button onClick={() => asfn(cur_num + 1) && this.setState({answer_id : keys[cur_num + 1]})}>{'>'}</button> }
                { is_moderator && approved && <div>
                    <span>Изменить порядок:</span>
                    <select value={answer.position} onChange={(e) => this.props.submit('REORDER_ANSWER', {'id' : answer.id, 'position': e.target.value})}>
                        { keys.filter((id) => answers[id].position > 0).map((id) =>
                            <option value={answers[id].position} key={id}>{'Позиция ' + answers[id].position}</option>
                        )}
                    </select>
                </div>}
                { answer && <Answer
                    submit={this.props.submit}
                    idInfo={this.props.idInfo}
                    data={answer}
                    dispatch={this.props.dispatch}
                /> }
                { answers_size == 0 && <p>Ещё нет ни одного ответа</p>}
                </div>
            );
        }
    }
}

export const ConnectedQuestionPage = connect((state, props) => ({
        idInfo : state.idInfo,
        answerText : state.answerText,
        questionsInfo : state.questionsInfo,
        submit : getSubmitFunction(state)
    }))(QuestionPage);
