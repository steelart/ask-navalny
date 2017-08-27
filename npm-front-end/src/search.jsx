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

    compareQuestions(id1, id2) {
        const questions = this.props.questionsInfo.questions;
        const q1 = questions[id1];
        const q2 = questions[id2];
        if (q1.official_answer && !q2.official_answer) {
            return -1;
        }
        if (!q1.official_answer && q2.official_answer) {
            return 1;
        }
        return q2.votes_number - q1.votes_number;
    }

    searchInputChanged(value) {
        this.setState({text : value});
        const questions = this.props.questionsInfo.questions;
        var ids = [];
        if (value.length != 0) for (var id in questions) {
            if (questions[id].text_str.toLowerCase().indexOf(value.toLowerCase()) > -1) {
                ids.push(id);
            }
        }
        ids.sort((id1, id2) => this.compareQuestions(id1, id2));
        this.setState({ ids : ids });
    }

    render() {
        return <div>
            <input
                type='text'
                value={this.state.text}
                onChange={(e) => this.searchInputChanged(e.target.value)}
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

