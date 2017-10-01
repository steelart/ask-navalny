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
import { Link } from 'react-router-dom';


class BaseButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {mouse: false};
    }

    render() {
        var { contentType, container, baseStyle, overStyle, ...resProps } = this.props; //TODO
        if (!baseStyle) baseStyle = "linkButtonStyle";
        if (!overStyle) overStyle = "linkButtonStyleMouse";
        const className = (this.state && this.state.mouse) ? overStyle : baseStyle;
        const res = React.createElement(contentType, {
                className: className,
                onMouseEnter: ()=>{this.setState({mouse: true})},
                onMouseLeave: ()=>{this.setState({mouse: false})},
                ...resProps
            });
        if (container)
            return React.createElement(container, {}, res);
        else
            return res;
    }
}

export class LinkButton extends React.Component {
    render() {
        return React.createElement(BaseButton, { contentType: Link, ...this.props });
    }
}

export class RefButton extends React.Component {
    render() {
        return React.createElement(BaseButton, { contentType: 'a', ...this.props });
    }
}

export class SimpleButton extends React.Component {
    render() {
        return React.createElement(BaseButton, { contentType: 'div', ...this.props });
    }
}

export class LinkButtonLI extends React.Component {
    render() {
        return React.createElement(LinkButton, { container: 'li', ...this.props });
    }
}

export class RefButtonLI extends React.Component {
    render() {
        return React.createElement(RefButton, { container: 'li', ...this.props });
    }
}

export class SimpleButtonLI extends React.Component {
    render() {
        return React.createElement(SimpleButton, { container: 'li', ...this.props });
    }
}
