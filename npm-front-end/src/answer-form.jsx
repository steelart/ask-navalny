import React from 'react';
import { connect } from 'react-redux';
import Linkify from 'react-linkify';

import { LinkButton, SimpleButton, RefButton, SimpleButtonLI, LinkButtonLI } from './buttons.jsx';
import { place_question } from './question.jsx';

import { api_connect, loadData } from './loading-api.jsx';
import { sdef, getSubmitFunction, LOADING_IN_PROCESS, LOADING_FAILED, LOADING_SUCCESSED } from './utils.jsx';

import { resetModalMode, dispatchModalMode } from './main-reducer.jsx'

import YouTubeParser from './youtube-parser.jsx';

export class AnswerForm extends React.Component {
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
            <input
                type="text"
                placeholder="youtube url"
                onChange={(event) => this.setAnswerText(event.target.value)}
                value={answerText}
            />
            <br/>
            <button onClick={() =>
                this.props.submit(
                    'new_answer',
                    { text : answerText, question: question_id },
                    () => { this.setAnswerText(''); resetModalMode(this); }
                )
            }>Предложить ответ</button>
            { answerText && <YouTubeParser text={answerText}/> }
            <button onClick={() => resetModalMode(this)}>отмена</button>
        </div>;
    }
}
