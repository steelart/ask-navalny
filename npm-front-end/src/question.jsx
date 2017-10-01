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
import Linkify from 'react-linkify';
import { Link } from 'react-router-dom';

import { Button } from 'reactstrap';

import { ConnectedAppHeader } from './app-header.jsx';

import { setLoginModalMode } from './login-page.jsx';

import { APPROVED, REJECTED, UNDECIDED, ANSWERED } from './utils.jsx';

import './style_okonst.css';

export class Question extends React.Component {
    button(action, name, style_field) {
        const id = this.props.data.id;
        // style_field is used also as style prefix
        return (
            <Button outline color="primary" size='lg'
                onClick={() => { this.props.idInfo.logged_in
                    ? this.props.submit(action, {'id' : id}, () =>
                        this.props.dispatch({type : action, question : id})
                      )
                    : setLoginModalMode(this)
                }}>
                {name}
            </Button>
        );
    }

    render() {
        const data = this.props.data;
        const banned = data.status == REJECTED;
        const answered = data.status == ANSWERED;
        const undecided = data.status == UNDECIDED;
        const is_moderator = this.props.idInfo.is_moderator;
        return (
            <div>
                <div className="questions_list">
                <div className={banned ? 'bannedQuestion' : (answered ? 'answeredQuestion one' : ' one')}>
                    <div className="question-pos">
                        <div className="question-pos-l">
                            <p className='title'>
                                <Link to={'/questions/' + data.id}>{data.text_str}</Link>
                            </p>
                            <span className="subtitle">{data.submit_date}</span>
                        </div>
                        { this.button('VOTE_FOR_QUESTION', '+' + data.votes_number, 'voted') }
                        {/* this.button('COMPLAIN_ABOUT_QUESTION', data.complains + ' Пожаловаться', 'complained')*/ }
                    </div>
                    { is_moderator && undecided && this.button('APPROVE_QUESTION', 'Одобрить') }
                    { is_moderator && ( banned
                        ? this.button('UNBAN_QUESTION', 'Разбанить')
                        : this.button('BAN_QUESTION', 'Забанить')
                    )}
                </div>
                </div>
            </div>
        );
    }
}

export function place_question(props, qs, qid, short) {
    const questionsInfo = props.questionsInfo;
    const voted_list = questionsInfo.voted_list;
    const complained_list = questionsInfo.complained_list;
    return <Question dispatch={props.dispatch}
        submit={props.submit}
        idInfo={props.idInfo}
        data={qs[qid]}
        voted={voted_list[qid]}
        complained={complained_list[qid]}
        short={short}
        key={qs[qid].id} />;
}
