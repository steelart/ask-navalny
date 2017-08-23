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

import { ConnectedAppHeader } from './app-header.jsx';

import { getSubmitFunction } from './utils.jsx';
import './style_okonst.css';
import './style_orange.css';

class QuestionForm extends React.Component {
    setQTextAC(text) {
        this.props.dispatch({
            type: 'SET_NEW_QUESTION_TEXT',
            text: text
        });
    }
    submitQuestion() {
        this.props.submit('NEW_QUESTION', {text : this.props.questionText}, (data) => {
            this.setQTextAC('');
            this.props.dispatch({type : 'SET_VOTED', question : data.id});
        });
    }
    render() {
        return (
            <div className="container">
                <div className="pagination-centered">
                    <div className="form-group qa-form">
                        <label className="form-label" for="comment">Задать вопрос</label>
                        <textarea className="form-control qa-area" rows="5" id="comment"
                            onChange={(e) => this.setQTextAC(e.target.value)}
                            value={this.props.questionText}/>
                        <br/>
                        <div className="text-center">
                            <a className="button button--blue">Отменить</a>
                            <a className="button button--orange" onClick={() => this.submitQuestion()} >Отправить</a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export const ConnectedQuestionForm = connect((state, props) => ({
        questionText: state.questionText,
        submit : getSubmitFunction(state)
    }))(QuestionForm);
