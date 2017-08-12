import React from 'react';
import { connect } from 'react-redux';
import { queryStringEncoding } from './utils.jsx';
const $ = require('jquery');
import { Question } from './question.jsx';
import { getSubmitFunction } from './utils.jsx';


class SearchPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            text : '',
            ids : []
        };
    }

    submit() {
        $.get( '/api/search?'+queryStringEncoding({ text : this.state.text }), (data) => {
            console.log(data);
            var ids = [];
            for (var num in data.found) {
                const q = data.found[num];
                ids.push(q.id);
            }
            this.props.dispatch({ type : 'ADD_QUESTIONS', questions : data.found });
            this.setState({ ids : ids });
        }).fail((data) => console.log("Seach failed"));

        //console.log(queryStringEncoding({ text : this.state.text }));
    }

    render() {
        return <div>
            <input
                type='text'
                value={this.state.text}
                onChange={(e) => this.setState({text : e.target.value})}
            />
            <button onClick={()=>this.submit()}>Найти</button>
            <br/>
            { this.state.ids.map((qid) => <Question dispatch={this.props.dispatch}
                submit={this.props.submit}
                idInfo={this.props.idInfo}
                data={this.props.questionsInfo.questions[qid]}
                voted={this.props.questionsInfo.voted_list[qid]}
                complained={this.props.questionsInfo.complained_list[qid]}
                short={true}
                key={qid} />
            )}
        </div>;
    }
}

export const ConnectedSearchPage = connect((state, props) => ({
        idInfo : state.idInfo,
        questionsInfo : state.questionsInfo,
        submit : getSubmitFunction(state)
    }))(SearchPage);

