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

import ReactDOM from 'react-dom';
import React from 'react';
import { Route, Link, Redirect, Switch, HashRouter, BrowserRouter } from 'react-router-dom';
import { withRouter } from 'react-router'
import { ConnectedRouter, routerReducer, routerMiddleware, push } from 'react-router-redux';

import { Provider, connect } from 'react-redux';

import Modal from 'react-modal';

import { APP_CONFIG } from './config.jsx';

import { history, mainStore, resetModalMode, dispatchModalMode } from './main-reducer.jsx';

import { ConnectedQuestionForm } from './ask-question-page.jsx';
import { ConnectedAppMenu } from './app-menu.jsx';

import { connectedQuestionsLastTemplate } from './last-questions-page.jsx';
import { connectedQuestionsTopTemplate } from './questions-list-template.jsx';

import { ConnectedQuestionPage } from './question-page.jsx';

import { queryStringEncoding } from './utils.jsx';
const $ = require('jquery');
import { Question } from './question.jsx';
import { getSubmitFunction } from './utils.jsx';

import { ConnectedModeratorLog } from './moderator-log.jsx'

import { ConnectedSearchPage } from './search.jsx'

import './bootstrap/css/bootstrap.css';
import './style_okonst.css';
import './style_orange.css';
import './global-init.jsx';

const ConnectedLastAllQuestionsPage = connectedQuestionsLastTemplate('all');
const ConnectedLastAnsweredQuestionsPage = connectedQuestionsLastTemplate('answered');
const ConnectedLastBannedQuestionsPage = connectedQuestionsLastTemplate('banned');
const ConnectedLastApprovedQuestionsPage = connectedQuestionsLastTemplate('approved');
const ConnectedLastUndecidedQuestionsPage = connectedQuestionsLastTemplate('undecided');
const ConnectedNewAnswersQuestionsPage = connectedQuestionsLastTemplate('newanswers');

const ConnectedTopApprovedQuestionsPage = connectedQuestionsTopTemplate('approved');
const ConnectedTopAnsweredQuestionsPage = connectedQuestionsTopTemplate('answered');


class NotFound extends React.Component {
    render() {
        return <div>
            <p> Страница не найдена </p>
            <Link to='/'>Главная</Link>
        </div>;
    }
}

class TodoPage extends React.Component {
    render() {
        return <div>
                <p>Возможно, надо будет сделать логин через гугл или ещё как</p>
                <p>Добавить (как-нибудь) верификацию голосов</p>
                <p>Добавить возможность редактировать вопрос</p>
                <p>Добавить возможность редактировать ответ</p>
                <p>Сделать проверку имени пользователя и пароля</p>
                <p>Сделать страницу для пользователя с вопросами, за которые он голосовал</p>
                <p>Сделать разные виды сортировки ответов</p>
                <p>Отобразить нормально время</p>
                <p>Возможно, при переходе с другой страницы на страницу Последние стоит автоматически добавлят новые вопросы</p>
                <p>Сделать поиск</p>
                <p>Для админов сделать страницу с наиболее частыми жалобами на вопросамы</p>
                <p>Сделать пожаловаться и бан для ответов</p>
                <p>Оповещать другие окна того же пользователя о его голосованиях</p>
                <p>Оповещать о потере соединения с сервером</p>
        </div>;
    }
}


const modalCustomStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

class App extends React.Component {
    login_modal() {
        const ModalContent = this.props.appConfig.modal_mode;
        return <Modal
              isOpen={ModalContent != null}
              onRequestClose={() => resetModalMode(this)}
              shouldCloseOnOverlayClick={false}
              style={modalCustomStyles}
              contentLabel="Example Modal"
            >
                { ModalContent != null && <ModalContent /> }
            </Modal>;
    }
    render() {
        return (
            <div>
                { this.login_modal() }
                <div className="page-header">
                    <ConnectedAppMenu/>
                </div>
                <div className='container'>
                    {this.props.children}
                </div>
            </div>
        );
    }
}

/*
<button type='button' onClick={() => { this.props.history.push('/new-location') }}>
    Click Me!
</button>
*/

const ConnectedApp = withRouter(connect((state, props) => ({
        appConfig : state.appConfig
    }))(App));


if (APP_CONFIG.debug) {
    console.log('Global app config: ', APP_CONFIG);
}
if (APP_CONFIG.api_version != 4) {
    //TODO: make normal message!
    alert("Версия сервера отличается от клиента. Возмоно, вам стоит капитально обновить страницу");
}

ReactDOM.render(
      <Provider store={ mainStore }>
        <ConnectedRouter history={history}><ConnectedApp><Switch>
            <Route exact path='/last-all' component={ConnectedLastAllQuestionsPage} />
            <Route exact path='/last-answered' component={ConnectedLastAnsweredQuestionsPage} />
            <Route exact path='/last-banned' component={ConnectedLastBannedQuestionsPage} />
            <Route exact path='/last-approved' component={ConnectedLastApprovedQuestionsPage} />
            <Route exact path='/last-undecided' component={ConnectedLastUndecidedQuestionsPage} />
            <Route exact path='/top-approved' component={ConnectedTopApprovedQuestionsPage} />
            <Route exact path='/top-answered' component={ConnectedTopAnsweredQuestionsPage} />
            <Route exact path='/last-undecided-answers' component={ConnectedNewAnswersQuestionsPage} />
            <Route exact path='/ask' component={ConnectedQuestionForm} />
            <Route exact path='/moderator-log' component={ConnectedModeratorLog} />
            <Route exact path='/todo' component={TodoPage} />
            <Route exact path='/search' component={ConnectedSearchPage} />
            <Route exact path='/question/:qid' component={ConnectedQuestionPage} />
            <Route exact path='/question/:qid/:aid' component={ConnectedQuestionPage} />
            <Redirect exact from='/' to='/last-answered' />
            <Redirect exact from='/last' to='/last-answered' />
            <Route path='*' component={NotFound} />
        </Switch></ConnectedApp></ConnectedRouter>
      </Provider>,
    document.getElementById('mount-point'));
