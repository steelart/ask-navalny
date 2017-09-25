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
import ReactDOM from 'react-dom'
import ReactSVG from 'react-svg'

import { connect } from 'react-redux';

import { APP_CONFIG } from './config.jsx';

import { mainStore, resetModalMode, dispatchModalMode } from './main-reducer.jsx';

import { LinkButton, SimpleButton, RefButton, LinkButtonLI, SimpleButtonLI, RefButtonLI } from './buttons.jsx';
import { TabContent, TabPane, Nav, NavItem, NavLink, Collapse, CardBlock, Card, Button, Row, Col } from 'reactstrap';
import classnames from 'classnames';

import { post_api } from './loading-api.jsx';
import { ConnectedRegistrationPage } from './registration-page.jsx';

import { sdef } from './utils.jsx';


function login_actions(dispatch, data) {
    dispatch({ type : 'SET_ID_INFO', result : {
        logged_in : true,
        personaname : data.username,
        is_moderator : data.is_moderator
    }});
    dispatch({type : 'SET_SELECTIONS', selections : data.selections});
    dispatch({type : 'SET_MODAL_MODE', modal_mode : null});
}

post_api('/api/check-logined', {}, (data) => {
    if(data.success)
        login_actions(mainStore.dispatch, data);
});

class LoginViaSocialNets extends React.Component {
    render() {
        const google = sdef(APP_CONFIG.social_auth).google;
        return <div>
            { google && <RefButton href={'/accounts/google/login/?next=' + encodeURIComponent(window.location.pathname)}>Войти через google</RefButton> }
        </div>;
    }
}


class LoginViaSocialNetsPage extends React.Component {
    render() {
        return <div>
            <LoginViaSocialNets/>
            <button onClick={()=>resetModalMode(this)}>отмена</button>
        </div>;
    }
}

export const ConnectedLoginViaSocialNetsPage =
    connect((state) => ({}))(LoginViaSocialNetsPage);

class LocalLoginPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username : '',
            password : '',
            incorrect_login : false,
            activeTab: '1'
        };
        this.toggle = this.toggle.bind(this);
    }

    error_text() {
        if (this.state.incorrect_login) return 'Неверное имя пользователя или пароль';
        return null;
    }

    toggle(tab) {
        if (this.state.activeTab !== tab) {
                this.setState({
                activeTab: tab
            });
        }
    }

    render() {
        const error_text = this.error_text();
        // TODO: save hostname for debug!

        return (
            <div className="login-modal">
                <TabContent activeTab={this.state.activeTab}>
                    <TabPane tabId="1">
                        <Row>
                            <Col sm="12">
                                <h2>Чтобы задать вопрос, авторизуйтесь:</h2>
                                <div className="loging-svg">
                                    <ReactSVG
                                        path="/static/askp/images/svg/vk.svg"
                                        callback={svg => console.log(svg)}
                                        className="example"
                                        style={{ width: 125 }}
                                    />
                                    <ReactSVG
                                        path="/static/askp/images/svg/facebook.svg"
                                        callback={svg => console.log(svg)}
                                        className="example"
                                        style={{ width: 125 }}
                                    />
                                    <ReactSVG
                                        path="/static/askp/images/svg/twitter.svg"
                                        callback={svg => console.log(svg)}
                                        className="example"
                                        style={{ width: 125 }}
                                    />
                                    <ReactSVG
                                        path="/static/askp/images/svg/google-plus.svg"
                                        callback={svg => console.log(svg)}
                                        className="example"
                                        style={{ width: 125 }}
                                    />
                                </div>
                                <NavLink onClick={() => { this.toggle('2'); }}>
                                    Войти с помощью формы
                                </NavLink>
                                <h5>После авторизации вы сможете добавлять<br/>ответы и задавать вопросы Алексею</h5>
                            </Col>
                        </Row>
                    </TabPane>
                    <TabPane tabId="2">
                        <Row>
                            <Col sm="12">
                                <NavLink onClick={() => dispatchModalMode(this, ConnectedRegistrationPage)}>Зарегистрироваться</NavLink>
                                <LoginViaSocialNets/>
                                <p>В тестовой версии безопасность передачи и хранение пароля не проработаны! Не используйте реальные пароли!</p>
                                <form >
                                    <input
                                        value={this.state.username}
                                        onChange={(e) => this.setState({username : e.target.value, incorrect_login : false})}
                                        type='email'
                                        placeholder='пользователь'
                                        autoCorrect='off'
                                        autoCapitalize='off'
                                        spellCheck='false'
                                    />
                                    <br/>
                                    <input
                                        value={this.state.password}
                                        onChange={(e) => this.setState({password : e.target.value})}
                                        type='password'
                                        placeholder='пароль'
                                        autoCorrect='off'
                                        autoCapitalize='off'
                                        spellCheck='false'
                                    />
                                </form>
                                {error_text && <p className={'errorText'}>{error_text}</p> }
                                <NavLink onClick={() => { this.toggle('1'); }}>
                                    Войти через социальную сеть
                                </NavLink>
                                <button onClick={()=>this.submit()}>Войти</button>
                                <button onClick={()=>resetModalMode(this)}>отмена</button>
                            </Col>
                        </Row>
                    </TabPane>
                </TabContent>
            </div>
        )

    }

    submit() {
        if (this.state.password == '') {
            this.setState({incorrect_login : true});
        } else {
            post_api('/api/simple-login', this.state, (data) => this.server_answer(data));
        }
    }

    server_answer(data) {
        if (data.success) {
            login_actions(this.props.dispatch, data);
        } else {
            this.setState({incorrect_login : true});
        }
    }
}

export const ConnectedLocalLoginPage = connect((state) => ({}))(LocalLoginPage);

class LoginPage extends React.Component {
    render() {
        return APP_CONFIG.local_users
            ? <ConnectedLocalLoginPage/>
            : <ConnectedLoginViaSocialNetsPage/>;
    }
}

export const ConnectedLoginPage = connect((state) => ({}))(LoginPage);

export function setLoginModalMode(connectedReactComp) {
    dispatchModalMode(connectedReactComp, ConnectedLoginPage);
}
