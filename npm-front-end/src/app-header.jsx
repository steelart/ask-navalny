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

import { Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavLink, InputGroup, InputGroupAddon, Input, Form, FormGroup } from 'reactstrap';

import { post_api } from './loading-api.jsx';

import { ConnectedLoginPage } from './login-page.jsx';
import { api_connect, loadData } from './loading-api.jsx';
import { sdef, getSubmitFunction, LOADING_IN_PROCESS, LOADING_FAILED, LOADING_SUCCESSED } from './utils.jsx';

class AppHeader extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            collapsed: true
        };
    }

	render() {
		return (
            <div className="bg_holder">
            <Form>
                <div class="question form-group has-feedback">
                    <FormGroup>
                    <Input type="text" name="email" class="form-control" id="question" aria-describedby="inputSuccess2Status" size="lg" placeholder="Спроси навального" />
                    </FormGroup>
                </div>
            </Form>
            </div>
		);
	}
}

export const ConnectedHeader = connect(
    (state) => ({
        idInfo : state.idInfo
    }))(AppHeader);
