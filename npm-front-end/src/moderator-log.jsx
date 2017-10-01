import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { api_connect, loadData } from './loading-api.jsx';

import {LOADING_IN_PROCESS, LOADING_FAILED, LOADING_SUCCESSED} from './utils.jsx';
import {APPROVED, REJECTED, UNDECIDED, ANSWERED} from './utils.jsx';

function get_action_name(action) {
    switch (action) {
        case APPROVED:
            return 'approved';
        case REJECTED:
            return 'rejected';
        case UNDECIDED:
            return 'undecided';
        case ANSWERED:
            return 'answered';
        default:
            return 'unknown';
    }
}

class ModeratorLog extends React.Component {
    show_item(item) {
        const type = item.type;
        const cqsa = type == 'ChangeQuestionStatusAction';
        const casa = type == 'ChangeAnswerStatusAction';
        const raa = type == 'ReorderAnswerAction';
        return <tr key={item.id}>
            <td>{item.submit_date}</td>
            <td>{item.moderator_name}</td>
            <td>{type}</td>
            {cqsa && <td><Link to={'/question/' + item.question}>q{item.question}</Link> </td>}
            {(casa || raa) && <td>a{item.answer}</td> }
            {(cqsa || casa) && <td>{get_action_name(item.new_status)}</td> }
            { raa && <td>{item.new_position}</td> }
        </tr>;
    }
    render() {
        const modlog = this.props.moderatorLog.modlog;
        const status = this.props.moderatorLog.status;
        if (status == LOADING_IN_PROCESS) {
            loadData(
                '/api/moderator-actions/0',
                'SET_MODERATOR_LOG',
                this.props.dispatch);
        }
        return <div>
            <p> Moderator log page </p>
            <table><tbody>
            { modlog && modlog.map((item) => this.show_item(item))}
            </tbody></table>
            { status == LOADING_FAILED && <p> Could not load log </p> }
        </div>;
    }
}

export const ConnectedModeratorLog = connect(
    (state) => ({
        moderatorLog : state.moderatorLog
    }))(ModeratorLog);
