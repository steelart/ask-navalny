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

import { LinkButton, SimpleButton, RefButton, SimpleButtonLI, LinkButtonLI } from './buttons.jsx';

export class Question extends React.Component {
    button(action, confirm_action, name, style_field) {
        const id = this.props.data.id;
        return <SimpleButtonLI
                baseStyle={this.props[style_field] ? (style_field+'Question') : 'linkButtonStyle'}
                onClick={() => { this.props.idInfo.logged_in
                    ? this.props.submit(action, {'id' : id}, () =>
                        confirm_action && this.props.dispatch({type : confirm_action, question : id})
                      )
                    : setLoginModalMode(this)
                }}>
                    {name}
                </SimpleButtonLI>;
    }

    render() {
        const data = this.props.data;
        return <div className={data.banned ? 'bannedQuestion' : (data.official_answer ? 'answeredQuestion' : 'questionInList')}>
            { this.button('vote', 'SET_VOTED', data.votes_number + '+', 'voted') }
            { this.button('COMPLAIN_ON_QUESTION', 'SET_COMPLAINED', data.complains + 'Пожаловаться', 'complained') }
            <span>{data.submit_date}</span>
            { this.props.idInfo.permissions.ban_question && ( data.banned
                ? this.button('UNBAN_QUESTION', null, 'Разбанить')
                : this.button('BAN_QUESTION', null, 'Забанить')
            )}
            { this.props.short && <LinkButtonLI to={'/questions/' + data.id}>Подробнее</LinkButtonLI> }
            <Linkify> <p className='questionContent'>{data.text_str}</p> </Linkify>
        </div>;
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
