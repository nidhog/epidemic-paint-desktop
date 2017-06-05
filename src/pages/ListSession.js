import React from 'react';
import {ListItem} from 'material-ui/List'

import browserHistory from '../routes/history';

const ListSession = ({session}) => {
    return (
        <ListItem id={'session-'+session.id} onClick={_getExistingSession.bind(session)}>
            {session.id} - {session.name} (artist: {session.artist})
        </ListItem>);
};


function _getExistingSession(e){
    _getSession(this.id, this.name, this.artist);
}

function _getSession(sessionID, sessionName, artistID){
    browserHistory.push('epidemic/'+
        '?sessionName='+sessionName+
        '&sessionID=' +sessionID+
        '&artistID='+artistID);
}

export default ListSession;