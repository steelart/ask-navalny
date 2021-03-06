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
import { Link } from 'react-router';
import { NOT_LOGINED_ID_INFO, dispatchModalMode } from './main-reducer.jsx';

import { LinkButton, SimpleButton, RefButton, LinkButtonLI, SimpleButtonLI, RefButtonLI } from './buttons.jsx';
import { Navbar, NavbarBrand, NavLink, Button } from 'reactstrap';

import { slide as Menu } from 'react-burger-menu';
import { post_api } from './loading-api.jsx';

import { ConnectedLoginPage } from './login-page.jsx';

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

    constructor(props) {
        super(props);

        this.state = {
            collapsed: true
        };
    }
    showSettings (event) {
    event.preventDefault();
  }

    render() {
        const logged_in = this.props.idInfo.logged_in;
        const personaname = this.props.idInfo.personaname;
        const is_moderator = this.props.idInfo.is_moderator;
        return (
            <div>
                <Navbar light>
                    <Menu>
                        <Link to="/last-answered" className="bm-menu">Последние отвеченные</Link>
                        <Link to="/top-approved" className="bm-menu">Популярные неотвеченные</Link>
                        <Link to="/top-answered" className="bm-menu">Популярные отвеченные</Link>
                        { is_moderator && <Link to="/last-all" className="bm-menu">Все последние</Link> }
                        { is_moderator && <Link to="/last-undecided" className="bm-menu">Немодерированные</Link> }
                        { is_moderator && <Link to="/last-banned" className="bm-menu">Забаненные</Link> }
                        { is_moderator && <Link to="/last-approved" className="bm-menu">Одобренные</Link> }
                        { is_moderator && <Link to="/last-undecided-answers" className="bm-menu">Последние неразмеченные ответы</Link> }
                        <Link to="/search" className="bm-menu">Заглушка поиска</Link>
                        <Link to="/ask" className="bm-menu">Спросить</Link>
                        { logged_in
                        ? <NavLink className="bm-menu" onClick={() => this.logout()}>{'Выйти(' + personaname + ')'}</NavLink>
                        : <LoginModal/>
                        }
                    </Menu>
                    <NavbarBrand href="/">
                        <svg className="logo" viewBox="0 0 685 76">
                            <g>
                                <path className="orange-fill" fill="#FF3300" d="M579.4 17.14L578.51 17.14C565.76 17.14 556.73 24.4 556.73 39.98L556.73 53.44C556.73 68.67 565.73 75.93 578.51 75.93L579.4 75.93C593.92 75.93 601.89 67.93 601.89 53.44L601.89 40C601.89 24.93 594.1 17.14 579.4 17.14zM587.72 53.26C587.72 59.99 585.6 63 578.87 63 573.56 63 570.87 60 570.87 53.26L570.87 39.8C570.87 33.6 573.35 29.88 579.19 29.88 585.39 29.88 587.69 33.6 587.69 39.8L587.72 53.26zM676.56 46.11C680.63 44.67 683.7 40.57 683.7 33.6 683.7 22.8 676.79 17.13 663.51 17.13L661.92 17.13C647.92 17.13 641.56 23.68 641.56 33.6 641.56 40.5 644.14 44.71 648.05 46.14 644.14 47.76 640.85 52.31 640.85 59.27 640.85 69.36 646.16 75.91 661.57 75.91L663.34 75.91C676.8 75.91 684.41 70.07 684.41 59.09 684.41 52.23 680.85 47.7 676.56 46.11zM662.09 27.94L662.8 27.94C668.64 27.94 670.41 30.77 670.41 34.14 670.41 37.51 668.64 40.34 662.8 40.34L662.09 40.34C656.6 40.34 654.65 37.51 654.65 34.14 654.65 30.77 656.43 27.94 662.09 27.94zM662.8 64.94L662.09 64.94C656.25 64.94 654.09 62.64 654.09 58.74 654.09 54.84 656.39 52.74 662.09 52.74L662.8 52.74C668.8 52.74 670.94 54.86 670.94 58.74 670.94 62.62 668.82 64.95 662.8 64.95L662.8 64.94zM614.46 60.87L629.33 60.87 629.33 75 614.46 75 614.46 60.87zM614.46 46.7L629.33 46.7 629.33 18.38 614.46 18.38 614.46 46.7zM541 50.78C547 44.78 549.5 39.98 549.5 33.07 549.5 23.33 543.3 17.31 530.55 17.31L529.49 17.31C515.68 17.31 509.3 23.86 509.3 36.43L522.93 36.43C522.93 31.65 525.59 29.17 529.66 29.17 533.73 29.17 535.33 31.12 535.33 34.17 535.33 37.53 534.27 40.17 528.25 46.17L509.63 64.77 509.63 75 549.83 75 549.83 61.58 530.31 61.58 541 50.78z"></path>
                                <path className="cyan-fill" fill="#007FA3" d="M176.91 18.38L158.67 75 173.54 75 176.7 64.38 196.58 64.38 199.93 75 215 75 197.8 18.38 176.91 18.38zM192.78 51.14L180.78 51.14 187 29.92 192.78 51.14zM295 35.55L289.51 35.55 289.51 18.38 275.36 18.38 275.36 75 293.78 75C310.42 75 317.15 67.56 317.15 54.46 317.15 41.93 310.6 35.55 295 35.55zM295.35 61.93L289.51 61.93 289.51 48.66 295.35 48.66C301.35 48.66 302.96 51.66 302.96 55.21 303 59.46 300.68 61.94 295.37 61.94L295.35 61.93z"></path>
                                <polygon className="cyan-fill" fill="#007FA3" points="352.57 46.71 338.4 46.71 338.4 18.38 324.23 18.38 324.23 75.04 338.4 75.04 338.4 60.87 352.57 60.87 352.57 75.04 366.73 75.04 366.73 18.38 352.57 18.38"></polygon>
                                <path className="cyan-fill" fill="#007FA3" d="M226.84 52.9C226.84 59.1 224.89 61.4 220.11 61.4L217.63 61.4 217.63 75 222.41 75.18C236 75.75 240.3 69 240.3 53.79L240.3 31.66 251.1 31.66 251.1 75 265.27 75 265.27 18.38 226.84 18.38 226.84 52.9zM480.59 18.38L494.22 18.38 494.22 75 480.22 75 480.22 41 460.23 75 446.77 75 446.77 18.38 460.77 18.38 460.77 51.48 480.59 18.38zM470.14 14.84L471 14.84C483 14.84 487.11 9 487.11 1.38L487.11 0 475.11 0 475.11 1C475.11 4 473.69 5.43 470.68 5.43 467.85 5.43 466.08 4.01 466.08 1L466.08 0 454.21 0 454.21 1.42C454.21 9 458.46 14.83 470.14 14.83L470.14 14.84z"></path>
                                <polygon className="cyan-fill" fill="#007FA3" points="28.69 46.71 14.53 46.71 14.53 18.38 .36 18.38 .36 75.04 14.53 75.04 14.53 60.87 28.69 60.87 28.69 75.04 42.86 75.04 42.86 18.38 28.69 18.38"></polygon>
                                <path className="cyan-fill" fill="#007FA3" d="M67.12 18.38L48.88 75 63.75 75 66.91 64.38 86.79 64.38 90.14 75 105.19 75 88 18.38 67.12 18.38zM83 51.13L71 51.13 77.18 29.91 83 51.13zM148.79 45.78C151.7 43.66 153.53 39.64 153.53 34.66 153.53 24.21 148.75 18.37 133.7 18.37L111.39 18.37 111.39 75 134.59 75C148.59 75 155.31 69.16 155.31 57.47 155.3 51 152.4 47.38 148.79 45.78zM125.56 30.78L134.06 30.78C137.42 30.78 139.55 32.37 139.55 35.78 139.55 39.19 137.78 40.78 134.24 40.78L125.56 40.78 125.56 30.78zM135.65 62.65L125.55 62.65 125.55 52.37 135.64 52.37C139 52.37 141.13 53.61 141.13 57.37 141.14 61.23 139 62.64 135.65 62.64L135.65 62.65zM422.51 18.38L436.68 18.38 436.68 75 422.51 75 422.51 18.38zM418.08 54.5C418.08 68.13 411.71 75.04 395.59 75.04L376.82 75.04 376.82 18.38 391 18.38 391 35.55 396.31 35.55C410.82 35.55 418.08 41.93 418.08 54.5zM403.91 55.21C403.91 51.67 402.32 48.66 397.18 48.66L391 48.66 391 61.94 397.2 61.94C401.44 61.94 403.92 59.46 403.92 55.21L403.91 55.21z"></path>
                            </g>
                        </svg>
                    </NavbarBrand>
                </Navbar>
            </div>
        );
    }
}


{ /* Login & reg modal */ }
var Boron = require('boron');
var styles = {
  btn: {
      position: 'fixed',
      top: 0,
      right: 0,
      margin: '1em auto',
      padding: '1em 2em',
      outline: 'none',
      fontSize: 16,
      fontWeight: '600',
      background: '#C94E50',
      color: '#FFFFFF',
      border: 'none'
  },
  container: {
      padding: '2em',
      textAlign: 'center',
      height: '100%'
  },
  title: {
    margin: 0,
    color: '#C94E50',
    fontWeight: 400
  }
}
var modalStyle = {
    width: '100vw',
    height: '100vh'
};
var LoginModal = React.createClass({
    toggleDialog: function(ref){
        return function(){
            this.refs[ref].toggle();
        }.bind(this)
    },
    getContent: function(modalName){
        return (
            <div style={styles.container}>
                <ConnectedLoginPage/>
                <div className="bm-cross-button bm-cross-button-mod">
                <span className="bm-cross-line">
                    <span className="bm-cross bm-cross-line-ch-1"></span>
                    <span className="bm-cross bm-cross-line-ch-2"></span>
                </span>
                <button className="bm-cross-btn" onClick={this.toggleDialog(modalName)}>Закрыть</button>
                </div>
            </div>
        );
    },
    getTiggerAndModal: function(modalName, textBtn){
        var Modal = Boron[modalName];
        return (
            <div>
                <NavLink className="bm-menu" onClick={this.toggleDialog(modalName)}>{textBtn}</NavLink>
                <Modal ref={modalName} modalStyle={modalStyle}>{this.getContent(modalName)}</Modal>
            </div>
        );
    },
    render: function() {
        var self = this;
        return (
            <div>
                { self.getTiggerAndModal('WaveModal', 'Войти') }
            </div>
        );
    }
});

export const ConnectedAppMenu = connect(
    (state) => ({
        idInfo : state.idInfo
    }))(AppMenu);
