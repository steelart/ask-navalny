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
import { Router, Route, IndexRoute, Redirect, browserHistory } from 'react-router';
import { Link } from 'react-router';

import { Provider, connect } from 'react-redux';

import Modal from 'react-modal';

import { mainStore, resetModalMode, dispatchModalMode } from './main-reducer.jsx';

import { ConnectedQuestionForm } from './ask-question-page.jsx';
import { ConnectedAppMenu } from './app-menu.jsx';
import { setLoginModalMode } from './login-page.jsx';

import { ConnectedLastQuestionsPage } from './last-questions-page.jsx';
import { connectedQuestionsListTemplate } from './questions-list-template.jsx';
import { ConnectedQuestionPage } from './question-page.jsx';

import { queryStringEncoding } from './utils.jsx';
const $ = require('jquery');
import { Question } from './question.jsx';
import { getSubmitFunction } from './utils.jsx';

import { ConnectedSearchPage } from './search.jsx'

// react-bootstrap
import Grid from 'react-bootstrap/lib/Grid'
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup'
import Form from 'react-bootstrap/lib/Form'

import './global-init.jsx';

import './styles.less';

const ConnectedTopQuestionsPage = connectedQuestionsListTemplate('top');
const ConnectedAnsweredQuestionsPage = connectedQuestionsListTemplate('answered');
const ConnectedBannedQuestionsPage = connectedQuestionsListTemplate('banned');


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
        return <div>
            { this.login_modal() }
            <ConnectedAppMenu/>
            <div className='App'>
                {this.props.children}
            </div>
        </div>;
    }
}

const ConnectedApp = connect((state, props) => ({
        appConfig : state.appConfig
    }))(App);

ReactDOM.render(
      <Provider store={ mainStore }>
        <Router history={browserHistory}>
            <Redirect from='/' to='/last' />

            <Route path='/' component={ConnectedApp}>
                <Route path='/last' component={ConnectedLastQuestionsPage} />
                <Route path='/top' component={ConnectedTopQuestionsPage} />
                <Route path='/answered' component={ConnectedAnsweredQuestionsPage} />
                <Route path='/banned' component={ConnectedBannedQuestionsPage} />
                <Route path='/ask' component={ConnectedQuestionForm} />
                <Route path='/todo' component={TodoPage} />
                <Route path='/search' component={ConnectedSearchPage} />
                <Route path='/questions/:id' component={ConnectedQuestionPage} />
            </Route>
            <Route path='*' component={NotFound} />
        </Router>
      </Provider>,
    document.getElementById('mount-point'));
