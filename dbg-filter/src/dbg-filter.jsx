import ReactDOM from 'react-dom';
import React from 'react';
const Cookies = require('js-cookie');

const $ = require('jquery');


class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {dbgcode: ''};

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event) {
        event.preventDefault();
        Cookies.set('dbgcode', this.state.dbgcode);
        location.reload(true);
    }

    render() {
        return <div>
            <h1>Фильтр для тестовой версии</h1>
            <form onSubmit={this.handleSubmit}>
                <label>
                    Дебажный код:
                    <input
                        type="text"
                        value={this.state.dbgcode}
                        onChange={(e) => this.setState({dbgcode : e.target.value})}
                        placeholder='Пороль для доступа к демо'
                        autoCorrect='off'
                        autoCapitalize='off'
                        spellCheck='false'
                    />
                </label>
                <input type="submit" value="установить" />
            </form>
        </div>;
    }
/*
    constructor(props) {
        super(props);
        this.state = {
            dbgcode : ''
        };
         this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event) {
        Cookies.set('dbgcode', this.state.dbgcode);
        console.log('dbgcode', this.state.dbgcode);
        alert('submitted: ' + this.state.dbgcode);
        event.preventDefault();
        //post_api('/api/simple-login', this.state, (data) => this.server_answer(data));
        //$.post('/api/simple-login', data, callback).fail(() => console.log('Failed post request ' + api_path));
    }

    render() {
        return <div>
            <h1>Фильтр для тестовой версии</h1>
            <form onSubmit={this.handleSubmit}>
                <input
                    value={this.state.dbgcode}
                    onChange={(e) => this.setState({dbgcode : e.target.value})}
                    type='text'
                    placeholder='Пороль для доступа к демо'
                    autoCorrect='off'
                    autoCapitalize='off'
                    spellCheck='false'
                />
                <input type="submit" value="отправить" />
            </form>
        </div>;
    }
*/
}

ReactDOM.render(<App/>, document.getElementById('mount-point'));
