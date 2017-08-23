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

import { Badge } from 'reactstrap';

import { LinkButton, SimpleButton, RefButton, SimpleButtonLI, LinkButtonLI } from './buttons.jsx';
import { place_question } from './question.jsx';

import { api_connect, loadData } from './loading-api.jsx';
import { sdef, getSubmitFunction, LOADING_IN_PROCESS, LOADING_FAILED, LOADING_SUCCESSED } from './utils.jsx';


function questionsListTemplate(templ_param) { return class extends React.Component {
    constructor(props) {
        super(props);
        if (this.props.questionsInfo[templ_param.section_name].status == LOADING_IN_PROCESS) {
            this.load();
        }
    }

    load() {
        templ_param.load_function(this.props.dispatch);
    }

    next() {
        const questionsInfo = this.props.questionsInfo;
        const ids = questionsInfo[templ_param.section_name].ids;
        const loaded_num = questionsInfo[templ_param.section_name].loaded_num;
        if (loaded_num < ids.length) {
            templ_param.reset_function(this.props.dispatch);
            const query = ids.slice(loaded_num, loaded_num+3).join(',');
            templ_param.upload_fuction(this.props.dispatch, query);
        }
    }

    render() {
        const questionsInfo = this.props.questionsInfo;
        const qs = questionsInfo.questions;
        const section = questionsInfo[templ_param.section_name];
        const status = section.status;
        const ids = section.ids;
        const loaded_num = section.loaded_num;

        return <div>
            { ids.slice(0, loaded_num).map((qid) => place_question(this.props, qs, qid, true) ) }
            <div className="text-center"><br/>
                {status == LOADING_IN_PROCESS && <Badge color="info">Идёт загрузка вопросов</Badge> }
                {status == LOADING_FAILED     && <a className="button button--orange" onClick={() => this.next()} >Ошибка, повторить!</a> }
                {(status == LOADING_SUCCESSED  && loaded_num < ids.length) && <a className="button button--blue" onClick={() => this.next()} >Показать еще</a> }
            </div><br/>
        </div>;
    }
}}


export function connectedQuestionsListTemplate(section_name) {
    const QuestionsPage = questionsListTemplate({
        load_function  : (dispatch) => loadData(
            '/api/' + section_name + '-questions',
            'SET_QUESTIONS_SECTION',
            dispatch,
            { section_name : section_name }
        ),
        upload_fuction : (dispatch, query) => loadData(
            '/api/query-questions?' + query,
            'UPLOAD_QUESTIONS_SECTION',
            dispatch,
            { section_name : section_name }
        ),
        reset_function : (dispatch) => dispatch({
            type : 'RESET_QUESTIONS_SECTION_LOADING',
            section_name : section_name
        }),
        section_name : section_name
    });

    const ConnectedQuestionsPage = connect((state) => ({
        idInfo : state.idInfo,
        questionsInfo : state.questionsInfo,
        submit : getSubmitFunction(state)
    }))(QuestionsPage);

    return ConnectedQuestionsPage;
}
