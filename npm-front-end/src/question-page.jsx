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

import YouTubeParser from './youtube-parser.jsx';

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
        const text_str = data.text_str;
        return <div className={this.props.choosedAnswer ? 'choosedAnswer' : 'answerInList'}>
            { this.button('LIKE_ANSWER', data.like_number + '+', 'like', 'votedQuestion') }
            { this.button('DISLIKE_ANSWER', data.dislike_number + '-', 'dislike', 'complainedQuestion') }
            <span>{data.submit_date}</span>
            { this.props.idInfo.permissions.choose_answer && this.button('CHOOSE_ANSWER', 'Выбрать ответ') }
            <Linkify> <p className='questionContent'>{text_str}</p> </Linkify>
            { text_str && <YouTubeParser text={text_str}/> }
        </div>;
    }
}

class AnswersList extends React.Component {
    render() {
        const question_id = this.props.question_id;
        const questionsInfo = this.props.questionsInfo;
        const question = questionsInfo.questions[question_id];
        const answers = questionsInfo.answers_map[question_id];
        if (!answers) {
            //loadData('/api/answers/' + question_id, 'SET_ANSWERS', this.props.dispatch, {question_id : question_id});

            return <div>
                <p> Идёт загрузка ответов </p>
            </div>;
        } else {
            const official_answer = question.official_answer;
            //tmp className='questionContent'
            return <div className='questionContent'>
                { official_answer && <Answer
                    submit={this.props.submit}
                    idInfo={this.props.idInfo}
                    data={answers[official_answer]}
                    dispatch={this.props.dispatch}
                    choosedAnswer={true}
                />}
                { Object.keys(answers).map((aid) => aid != official_answer &&
                    <Answer submit={this.props.submit}
                        idInfo={this.props.idInfo}
                        data={{
                            ...answers[aid],
                            like : questionsInfo.liked_answers_list[aid],
                            dislike : questionsInfo.disliked_answers_list[aid]
                        }}
                        dispatch={this.props.dispatch}
                        choosedAnswer={official_answer == answers[aid].id}
                        key={answers[aid].id} /> )
                }
            </div>;
        }
    }
}

class AnswerForm extends React.Component {
    setAnswerText(text) {
        this.props.dispatch({
            type: 'SET_ANSWER_TEXT',
            text: text
        });
    }
    render() {
        const question_id = this.props.question_id;
        const answerText = this.props.answerText;
        return <div>
            <h2>Предложите ваш ответ</h2>
            <textarea
                cols="30" rows="10"
                onChange={(event) => this.setAnswerText(event.target.value)}
                value={answerText}
            />
            <button onClick={() =>
                this.props.submit(
                    'new_answer',
                    { text : answerText, question: question_id },
                    () => { this.setAnswerText(''); resetModalMode(this); }
                )
            }>Предложить ответ</button>
            {answerText && <Answer
                idInfo={this.props.idInfo}
                submit={() => {}}
                data={{
                    submit_date : '<<тут будет время>>',
                    like_number : 0,
                    dislike_number : 0,
                    text_str : answerText
                }}
                choosedAnswer={false}
            />}
            <button onClick={() => resetModalMode(this)}>отмена</button>
        </div>;
    }
}

class QuestionPage extends React.Component {
    render() {
        const question_id = this.props.params.id;
        const questionsInfo = this.props.questionsInfo;
        const answers = questionsInfo.answers_map[question_id];

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
            return <div>
                { place_question(this.props, questionsInfo.questions, question_id, false) }
                <button onClick={() => this.props.idInfo.logged_in
                    ? dispatchModalMode(this, ConnectedAnswerForm)
                    : setLoginModalMode(this)
                }>Предложить ответ</button>
                <AnswersList
                    idInfo={this.props.idInfo}
                    questionsInfo={questionsInfo}
                    question_id={question_id}
                    submit={this.props.submit}
                    dispatch={this.props.dispatch}/>
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
