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

import { ConnectedAppHeader } from './app-header.jsx';
import { LinkButton, SimpleButton, RefButton, SimpleButtonLI, LinkButtonLI } from './buttons.jsx';
import { place_question } from './question.jsx';
import { Badge } from 'reactstrap';

import { api_connect, loadData } from './loading-api.jsx';
import { sdef, getSubmitFunction, LOADING_IN_PROCESS, LOADING_FAILED, LOADING_SUCCESSED } from './utils.jsx';


function questionsLastTemplate(templ_param) {
    const sname = templ_param.section_name;
    return class extends React.Component {

    constructor(props) {
        super(props);
        if (this.props.questionsInfo[sname].status == LOADING_IN_PROCESS) {
            this.load(0);
        }
    }

    load(start_id) {
        templ_param.load_function(this.props.dispatch, start_id);
    }

    reload() {
        templ_param.reset_function(this.props.dispatch);
        var ids = this.props.questionsInfo[sname].ids;
        if (ids.length > 0)
            this.load(ids[ids.length-1])
        else
            this.load(0)
    }

    show_new_questions() {
        templ_param.show_new(this.props.dispatch);
    }

    render() {
        const questionsInfo = this.props.questionsInfo;
        const status = questionsInfo[sname].status;
        const qs = questionsInfo.questions;
        const ids = questionsInfo[sname].ids;
        const new_ids = questionsInfo[sname].new_ids;
        const voted_list = questionsInfo.voted_list;
        //console.log('voted_list', voted_list);
        //{new_ids.length == 0 && <button> заменить на пустое место того же размера </button> }
        return (
            <div>
                <ConnectedAppHeader/>
                {new_ids.length != 0 && <button onClick={() => this.show_new_questions()} > { 'Показать новый вопросы, их всего ' + new_ids.length } </button> }
                { ids.map((qid) => place_question(this.props, qs, qid, true) ) }
                <div className="text-center"><br/>
                    {status == LOADING_IN_PROCESS && <Badge color="info">Идёт загрузка вопросов</Badge> }
                    {status == LOADING_FAILED     && <a className="button button--orange" onClick={() => this.reload()} >Ошибка, повторить!</a> }
                    {status == LOADING_SUCCESSED  && <a className="button button--blue" onClick={() => this.reload()} >Показать еще</a> }
                </div><br/>
            </div>
        );
    }
}}


export function connectedQuestionsLastTemplate(short_name) {
    const full_name = 'last_' + short_name;
    const QuestionsPage = questionsLastTemplate({
        load_function  : (dispatch, start_id) => loadData(
            '/api/last-questions/' + short_name + '/' + start_id,
            'SET_QUESTION_LAST',
            dispatch,
            { section_name : full_name }
        ),
        reset_function : (dispatch) => dispatch({
            type : 'RESET_QUESTIONS_SECTION_LOADING',
            section_name : full_name
        }),
        show_new : (dispatch) => dispatch({
            type : 'SHOW_NEW_QUESTIONS',
            section_name : full_name
        }),
        section_name : full_name
    });

    const ConnectedQuestionsPage = connect((state) => ({
        idInfo : state.idInfo,
        questionsInfo : state.questionsInfo,
        submit : getSubmitFunction(state)
    }))(QuestionsPage);

    return ConnectedQuestionsPage;
}

