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

import { createStore, combineReducers, applyMiddleware } from 'redux';

import {sdef, fld, getIdMap, LOADING_IN_PROCESS, LOADING_FAILED, LOADING_SUCCESSED} from './utils.jsx';
import { Button, Form, FormGroup, Label, Input, FormText, Modal, Alert } from 'reactstrap';

var questionReducer = function (state = '', action) {
    switch (action.type) {
        case 'SET_NEW_QUESTION_TEXT':
            return action.text;
        default:
            return state;
    }
};

var answerReducer = function (state = '', action) {
    switch (action.type) {
        case 'SET_ANSWER_TEXT':
            return action.text;
        default:
            return state;
    }
};

var socketReducer = function (state=null, action) {
    //console.log('socketReducer was called with state', state, 'and action', action)
    switch (action.type) {
        case 'SET_WEB_SOCKET':
            return action.socket;

        default:
            return state;
    }
}

export const UNINITED_LOADED_DATA={ data: null, inited: false, success: undefined };

var loadedDataReducer = function (state=UNINITED_LOADED_DATA, action, type) {
    //console.log('loadedDataReducer was called with state', state, 'and action', action)
    switch (action.type) {
        case type:
            return action.result;

        default:
            return state;
    }
}

export const NOT_LOGINED_ID_INFO = {
    logged_in : false,
    personaname : null,
    is_moderator : false,
};

var idInfoReducer = function (state=NOT_LOGINED_ID_INFO, action) {
    switch (action.type) {
        case 'SET_ID_INFO':
            return action.result;

        default:
            return state;
    }
}


const questionsLoadedLastDefault = {
    status : LOADING_IN_PROCESS,
    ids : [],
    new_ids : [],
}

const questionsLoadedListDefault = {
    status : LOADING_IN_PROCESS,
    ids : [],
    loaded_num : 0
}


const questionsDefault = {
    questions : {},
    answers_map : {}, // question_id -> list of answers

    voted_list : {}, // list of voted question_id
    complained_list : {}, // list of voted question_id

    liked_answers_list : {}, // list of liked answers
    disliked_answers_list : {}, // list of disliked answers

    last_all : questionsLoadedLastDefault,
    last_answered : questionsLoadedLastDefault,
    last_banned : questionsLoadedLastDefault,
    last_approved : questionsLoadedLastDefault,
    last_undecided : questionsLoadedLastDefault,
    last_newanswers : questionsLoadedLastDefault,

    top_approved : questionsLoadedListDefault,
    top_answered : questionsLoadedListDefault,
};


function set_selections(state, input_list, output_name) {
    const list = sdef(input_list);
    var r = {};
    for (var i in list) {
        r[list[i]] = true;
    }
    return fld(state, output_name, r);
}

function questionsReducer(state=questionsDefault, action) {
    switch (action.type) {
        case 'ADD_QUESTIONS':
            var questions = { ...sdef(state.questions) };
            for (var i = 0; i < action.questions.length; i++) {
                var q = action.questions[i];
                questions[q.id] = q;
            }
            return fld(state, 'questions', questions);

        case 'SET_QUESTION_LAST':
            const sname = action.section_name;
            var last = { ...state[sname] };
            var res = { ...state };
            res[sname] = last;
            if (action.result.data) {
                last.status = LOADING_SUCCESSED;
                var questions = { ...sdef(state.questions) };
                var last_ids = [ ...last.ids ];
                //console.log('SET_QUESTION_LAST: action: ', action);
                for (var i = 0; i < action.result.data.questions.length; i++) {
                    var q = action.result.data.questions[i];
                    questions[q.id] = q;
                    last_ids.push(q.id);
                }
                res.questions = questions;
                last.ids = last_ids;
            } else {
                last.status = LOADING_FAILED;
            }
            return res;

        case 'RESET_QUESTIONS_SECTION_LOADING':
            return fld(state, [action.section_name, 'status'], LOADING_IN_PROCESS);

        case 'SET_QUESTIONS_SECTION': {
            const section_name = action.section_name;
            var res = { ...state };
            if (action.result.data) {
                var questions = { ...sdef(state.questions) };
                var in_questions = action.result.data.questions;
                for (var i = 0; i < in_questions.length; i++) {
                    var q = in_questions[i];
                    questions[q.id] = q;
                }
                res.questions = questions;
                res[section_name] = {
                    status : LOADING_SUCCESSED,
                    ids : action.result.data.id_list,
                    loaded_num : in_questions.length
                };
            } else {
                res[section_name] = { ...state[section_name], status : LOADING_FAILED };
            }
            return res;
        }

        case 'UPLOAD_QUESTIONS_SECTION': {
            const section_name = action.section_name;
            var res = { ...state };
            if (action.result.data) {
                var questions = { ...sdef(state.questions) };
                var in_questions = action.result.data.questions;
                for (var i = 0; i < in_questions.length; i++) {
                    var q = in_questions[i];
                    questions[q.id] = q;
                }
                res.questions = questions;
                res[section_name] = { ...state[section_name],
                    status : LOADING_SUCCESSED,
                    loaded_num : state[section_name].loaded_num + in_questions.length
                };
            } else {
                res[section_name] = { ...state[section_name], status : LOADING_FAILED };
            }
            return res;
        }

        case 'UPDATE_QUESTION': {
            const id = action.question.id;
            if (!state.questions[id])
                return state;
            return fld(state, ['questions', id], action.question);
        }

        case 'NEW_QUESTION': {
            const id = action.question.id;
            var questions = {...state.questions};
            questions[id] = action.question;
            var s = state;
            s = fld(s, 'questions', questions);
            if (state.last_all.ids.length > 0) { // check, that 'last questions' page is initialized
                var new_ids = [...state.last_all.new_ids];
                new_ids.unshift(id);
                s = fld(s, ['last_all', 'new_ids'], new_ids);
            }
            return s;
        }
        case 'SHOW_NEW_QUESTIONS': {
            const sname = action.section_name;
            var last_ids = [ ...state[sname].new_ids, ...state[sname].ids ];
            var s = state;
            s = fld(s, [sname, 'new_ids'], []);
            s = fld(s, [sname, 'ids'], last_ids);
            return s;
        }

        case 'SET_ANSWERS': {
            if (!action.result.data) {
                return state;
            }
            const question_id = action.question_id;

            var questions = {...state.questions};
            questions[question_id] = action.result.data.question;

            var answers_map = {...state.answers_map};
            answers_map[question_id] = getIdMap(action.result.data.answers);

            return { ...state, questions : questions, answers_map : answers_map};
        }

        case 'SET_ANSWER_DATA': {
            const question_id = action.answer.question;

            if (!state.answers_map[question_id])
                return state;

            return fld(state, ['answers_map', question_id, action.answer.id], action.answer);
        }

        case 'SET_SELECTIONS': {
            var s = state;
            s = set_selections(s, action.selections.votes, 'voted_list');
            s = set_selections(s, action.selections.complains, 'complained_list');
            s = set_selections(s, action.selections.likes, 'liked_answers_list');
            s = set_selections(s, action.selections.dislikes, 'disliked_answers_list');
            return s;
        }

        case 'VOTE_FOR_QUESTION': {
            return fld(state, ['voted_list', action.question], true);
        }
        case 'COMPLAIN_ABOUT_QUESTION': {
            return fld(state, ['complained_list', action.question], true);
        }

        case 'LIKE_ANSWER': {
            return fld(state, ['liked_answers_list', action.answer], true);
        }
        case 'DISLIKE_ANSWER': {
            return fld(state, ['disliked_answers_list', action.answer], true);
        }

        default:
            return state;
    }
}

const moderatorLogDefault = {
    modlog : null,
    status : LOADING_IN_PROCESS
}

function moderatorLogReducer(state=moderatorLogDefault, action) {
    switch (action.type) {
        case 'SET_MODERATOR_LOG': {
            //console.log('modlog', sdef(sdef(action.data).result).modlog);
            if (action.result.data) {
                return { modlog : action.result.data.modlog, status : LOADING_SUCCESSED };
            } else {
                console.log('FAIL!!!!!!!!');
                return fld(state, 'status', LOADING_FAILED);
            }
        }
        default:
            return state;
    }
}

function appConfigReducer(state={ modal_mode : null }, action) {
    switch (action.type) {
        case 'SET_MODAL_MODE': {
            return fld(state, 'modal_mode', action.modal_mode);
        }
        default:
            return state;
    }
}


export function dispatchModalMode(connectedReactComp, modal_mode) {
    connectedReactComp.props.dispatch({type : 'SET_MODAL_MODE', modal_mode : modal_mode});
}

export function resetModalMode(connectedReactComp) {
    dispatchModalMode(connectedReactComp, null);
}

import createHistory from 'history/createBrowserHistory';
export const history = createHistory();

import { ConnectedRouter, routerReducer, routerMiddleware, push } from 'react-router-redux';

const middleware = routerMiddleware(history);

var reducer = combineReducers({
    router: routerReducer,

    questionText: questionReducer,
    answerText: answerReducer,
    webSocket: socketReducer,

    idInfo: idInfoReducer,

    questionsInfo: questionsReducer,

    moderatorLog: moderatorLogReducer,

    appConfig : appConfigReducer
});

export let mainStore = createStore(reducer, applyMiddleware(middleware));
