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
import { NOT_LOGINED_ID_INFO, dispatchModalMode } from './main-reducer.jsx';

import { Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavLink, Media} from 'reactstrap';
import logo from './img/logo.svg';

import { post_api } from './loading-api.jsx';

import { setLoginModalMode } from './login-page.jsx';

class AppMenu extends React.Component {
    constructor(props) {
        super(props);

        this.toggleNavbar = this.toggleNavbar.bind(this);
        this.state = {
            collapsed: true
        };
    }

    toggleNavbar() {
        this.setState({
            collapsed: !this.state.collapsed
        });
    }

	render() {
		return (
            <Navbar color="transparent" light>
                <NavbarToggler left onClick={this.toggleNavbar} />
                <NavbarBrand href="/" >
                    <div className="navbar-header">
                        <img src={logo} className="" alt="НАВАЛЬНЫЙ 20!8" width={300} />
                    </div>
                </NavbarBrand>
                <Collapse className="navbar-toggleable-md" isOpen={!this.state.collapsed}>
                    <Nav className="ml-auto" vertical>
                        <NavItem>
                            <NavLink href="/last/">Все ответы</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink href="/#/">Предложить ответ</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink href="/ask/">Спросить</NavLink>
                        </NavItem>
                    </Nav>
                </Collapse>
            </Navbar>
		);
	}
}
/*      OLD NAV
class AppMenu extends React.Component {
    logout() {
        post_api('/api/logout', this.state, (data) => this.logout_answer(data));
    }

    logout_answer(data) {
        if (data.success) {
            this.props.dispatch({ type: 'SET_ID_INFO', result : NOT_LOGINED_ID_INFO });
            this.props.dispatch({ type : 'SET_SELECTIONS', selections : {} });
        } else {
            console.log('Some dark magic during logout!');
        }
    }

    render() {
        const logged_in = this.props.idInfo.logged_in;
        const personaname = this.props.idInfo.personaname;
<<<<<<< HEAD
        return <div className='mainMenu'> <div className='App'>
            { logged_in
                ? <SimpleButtonLI onClick={() => this.logout()}>{'Выйти(' + personaname + ')'}</SimpleButtonLI>
                : <SimpleButtonLI onClick={() => dispatchModalMode(this, ConnectedLoginPage)}>Войти</SimpleButtonLI>
            }
            <LinkButtonLI to={'/last'}>Последние</LinkButtonLI>
            <LinkButtonLI to={'/top'}>Популярные</LinkButtonLI>
            <LinkButtonLI to={'/answered'}>Отвеченные</LinkButtonLI>
            <LinkButtonLI to={'/banned'}>Забаненные</LinkButtonLI>
            {logged_in && <LinkButtonLI to={'/ask'}>Новый вопрос</LinkButtonLI> }
            <LinkButtonLI to={'/search'}>Поиск</LinkButtonLI>
            <LinkButtonLI to={'/todo'}>todo</LinkButtonLI>
        </div></div>;
    }
}*/
=======
        return<div> <Navbar>
            <Navbar.Header>
                <Navbar.Brand>
                    <span>Навальный 20!8</span>
                </Navbar.Brand>
                <Navbar.Toggle />
            </Navbar.Header>
            <Navbar.Collapse>
                <Nav navbar>
                    <NavItem><LinkButtonLI to={'/last'}>Последние</LinkButtonLI></NavItem>
                    <NavItem><LinkButtonLI to={'/top'}>Популярные</LinkButtonLI></NavItem>
                    <NavItem><LinkButtonLI to={'/answered'}>Отвеченные</LinkButtonLI></NavItem>
                    <NavItem><LinkButtonLI to={'/banned'}>Забаненные</LinkButtonLI></NavItem>
                    <NavItem><LinkButtonLI to={'/search'}>Поиск</LinkButtonLI></NavItem>
                    <NavItem><LinkButtonLI to={'/todo'}>todo</LinkButtonLI></NavItem>
                    <NavItem>{logged_in && <LinkButtonLI to={'/ask'}>Новый вопрос</LinkButtonLI> }</NavItem>
                    { logged_in
                        ? <NavItem onClick={() => this.logout()}>{'Выйти(' + personaname + ')'}</NavItem>
                        : <NavItem onClick={() => setLoginModalMode(this)}>Войти</NavItem>
                    }
                </Nav>
            </Navbar.Collapse>
            </Navbar>
            <div className="container">
            <div className="bg_holder">

                <div className="question form-group has-feedback">
                <span className=" form-control-feedback" aria-hidden="true"></span>
                <div className="question form-group has-feedback">
				<FormControl type="text" className="form-control" id="question" aria-describedby="inputSuccess2Status" placeholder="Спроси Навального" data-toggle="dropdown"/>
				<span className="form-control-feedback" aria-hidden="true"></span>

		        </div>


            </div>

        </div>

		</div>

				</div>;
    }

}

>>>>>>> 9f8dbcd2aec2b7339b273494cd84b19b5d67f796

export const ConnectedAppMenu = connect(
    (state) => ({
        idInfo : state.idInfo
    }))(AppMenu);
