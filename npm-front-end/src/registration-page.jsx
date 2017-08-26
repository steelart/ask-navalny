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

import { APP_CONFIG } from './config.jsx';

import { resetModalMode, dispatchModalMode } from './main-reducer.jsx';

import { LinkButton, SimpleButton, RefButton, LinkButtonLI, SimpleButtonLI, RefButtonLI } from './buttons.jsx';

import { post_api } from './loading-api.jsx';

import { ConnectedLoginPage } from './login-page.jsx';


class RegistrationPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username : '',
            password : '',
            password_confirm : '',
            admin : false,
            user_is_existed : false,
            registered : false
        };
    }

    error_text() {
        if (this.state.user_is_existed) return 'Такой пользователь уже существует';
        if (this.state.username == '') return 'Поле пользователь не заполненно';
        if (this.state.password == '') return 'Не указан пароль';
        if (this.state.password != this.state.password_confirm) return 'Пароли не совпадают';
        return null;
    }

    render() {
        if (this.state.registered) {
            return <div>
                <p>Вы успешно зарегистрировались</p>
                <button onClick={() => dispatchModalMode(this, ConnectedLoginPage)}>Войти</button>
                <button onClick={() => resetModalMode(this)}>отмена</button>
            </div>;
        } else {
            return this.unregisterd_render();
        }
    }

    unregisterd_render() {
        //placeholder='••••••••••'
        const error_text = this.error_text();
        return <div>
            <p>В тестовой версии безопасность передачи и хранение пароля не проработаны! Не используйте реальные пароли!</p>
            <p>TODO: сделать проверку на вводимые символы</p>
            <form >
                <input
                    value={this.state.username}
                    onChange={(e) => this.setState({username : e.target.value, user_is_existed : false})}
                    type='email'
                    placeholder='пользователь'
                    autoCorrect='off'
                    autoCapitalize='off'
                    spellCheck='false'
                />
                <br/>
                <input
                    value={this.state.password}
                    onChange={(e) => this.setState({password : e.target.value, user_is_existed : false})}
                    type='password'
                    placeholder='пароль'
                    autoCorrect='off'
                    autoCapitalize='off'
                    spellCheck='false'
                />
                <br/>
                <input
                    value={this.state.password_confirm}
                    onChange={(e) => this.setState({password_confirm : e.target.value})}
                    type='password'
                    placeholder='ещё раз пароль'
                    autoCorrect='off'
                    autoCapitalize='off'
                    spellCheck='false'
                />
                <br/>
                { APP_CONFIG.local_users.admin_registration && <div>
                    <input type="checkbox" checked={this.state.admin} readOnly={true} onChange={(event) => {
                        this.setState({admin : event.target.checked});
                    }}/>
                    <span>В тестовой версии буду админом!</span>
                </div> }
            </form>
            { error_text
                ? <p className={'errorText'}>{error_text}</p>
                : <button onClick={()=>this.submit()}>Зарегистрироваться</button> }
            <button onClick={()=>resetModalMode(this)}>отмена</button>
       </div>;
    }

    submit() {
        post_api('/api/registration', this.state, (data) => this.server_answer(data));
    }

    server_answer(data) {
        if (data.success) {
            this.setState({registered : true});
        } else {
            this.setState({registered : false, user_is_existed : true});
        }
    }
}

export const ConnectedRegistrationPage = connect((state) => ({}))(RegistrationPage);
