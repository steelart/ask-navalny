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
import { Jumbotron, Container, InputGroup, InputGroupAddon, Input, Form, FormGroup } from 'reactstrap';
import { Button, ButtonGroup, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavLink, Row } from 'reactstrap';

import {
            LinkButton,
            SimpleButton,
            RefButton,
            SimpleButtonLI,
            LinkButtonLI

} from './buttons.jsx';

import { place_question } from './question.jsx';

import { api_connect, loadData } from './loading-api.jsx';
import { sdef, getSubmitFunction, LOADING_IN_PROCESS, LOADING_FAILED, LOADING_SUCCESSED } from './utils.jsx';


class LastQuestionsPage extends React.Component {
    constructor(props) {
        super(props);
        if (this.props.questionsInfo.last_status == LOADING_IN_PROCESS) {
            this.load(0);
        }
    }

    load(start_id) {
        loadData('/api/last-questions/' + start_id, 'SET_QUESTION_LAST', this.props.dispatch);
    }

    reload() {
        this.props.dispatch({type:'RESET_QUESTIONS_LAST_LOADING'});
        var ids = this.props.questionsInfo.last_ids;
        if (ids.length > 0)
            this.load(ids[ids.length-1])
        else
            this.load(0)
    }

    show_new_questions() {
        this.props.dispatch({type:'SHOW_NEW_QUESTIONS'});
    }

    render() {
        const questionsInfo = this.props.questionsInfo;
        const status = questionsInfo.last_status;
        const qs = questionsInfo.questions;
        const ids = questionsInfo.last_ids;
        const new_ids = questionsInfo.new_ids;
        const voted_list = questionsInfo.voted_list;
        //console.log('voted_list', voted_list);
        //{new_ids.length == 0 && <button> заменить на пустое место того же размера </button> }
        return (
            <div>
                <div className="">
                    <div className="sort_holder text-center">
            			<div className="sort-panel btn-group btn-group-justified" role="group" aria-label="...">
            				<a href="/top" className="btn btn-default active" role="button">Популярное</a>
            				<a href="/#" className="btn btn-default" role="button">Новое</a>
            				<a href="/#" className="btn btn-default" role="button">Неотвеченное</a>
            			</div>
            		</div>
           		</div>
                <div className="questions_list">
                    {new_ids.length != 0 && <button onClick={() => this.show_new_questions()} > { 'Показать новый вопросы, их всего ' + new_ids.length } </button> }
                    { ids.map((qid) => place_question(this.props, qs, qid, true) ) }
                    <br />
                    <div className="text-center">
                        {status == LOADING_IN_PROCESS && <p> Идёт загрузка вопросов </p> }
                        {status == LOADING_FAILED     && <Button outline color="danger" onClick={() => this.reload()}>Ошибка, повторить</Button>}
                        {status == LOADING_SUCCESSED  && <Button outline color="primary" onClick={() => this.reload()}>Показать ещё</Button>}
                    </div>
                    <br />
                </div>
            </div>
        );
    }
}

export const ConnectedLastQuestionsPage = connect((state) => ({
    idInfo : state.idInfo,
    questionsInfo : state.questionsInfo,
    submit : getSubmitFunction(state)
}))(LastQuestionsPage);
