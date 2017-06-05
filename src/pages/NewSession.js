import React from 'react';

import TextField from 'material-ui/TextField';

import {Card, CardActions} from 'material-ui/Card';
import Subheader from 'material-ui/Subheader';

import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import DragIcon from 'material-ui/svg-icons/editor/drag-handle';
import BackArrowIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-left';

import browserHistory from '../routes/history';
import getParams from '../utils/parsing'

const styles = {
    outerButton: {
        verticalAlign: 'middle',
    },
    innerAction: {
        cursor: 'pointer',
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        width: '100%',
        opacity: 0,
    },
};

const sessionUrl = 'http://webcanva.herokuapp.com/canvas/api/v1/sessions/'

class NewSession extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            name: null,
        }
    }

    _addSession(){
        const { search } = this.props.location;
        const artistID = getParams('artistID', search);

        fetch(
            sessionUrl, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: this.state.name,
                    artist: artistID,
                })
            }).then( (json) => {
            if(json.status == 200 || json.status == 201 ){
                return json.json();

            }
            else{
                browserHistory.push('new');
            };

        }).then( (json) => {
            console.log(json)
            browserHistory.push('epidemic/' +
                '?sessionName=' + this.state.name +
                '&sessionID=' + json.id +
                '&artistID=' + artistID);


        }).catch( (ex) => {
                console.log('parsing failed', ex)
            })
    }

    _newSession(){
        browserHistory.push('loading');
        this._addSession();
    }

    offlineSession(){
        const { search } = this.props.location;
        const artistID = getParams('artistID', search);
        browserHistory.push('epidemic/'+
            '?sessionName='+this.state.name+
            '&sessionID=12' +
            '&artistID='+artistID);
    }


    allSessions(){
        const { search } = this.props.location;
        const artistID = getParams('artistID', search);
        browserHistory.push('all/'+
            '?artistID='+artistID);
    }

    goBack(){
        browserHistory.push('/');
    }

    updateName(event, name){
        this.setState({name: name});
    }

    render(){


        return (

            <Card>
                <Subheader>Login</Subheader>
                <TextField floatingLabelText="Session Name"
                           value={this.state.name}
                           onChange={ this.updateName.bind(this)} /><br/>
                <CardActions>
                    <FlatButton label="New Session" style={styles.outerButton}  onClick={this._newSession.bind(this)}>
                    </FlatButton>
                    <FlatButton label="Offline Mode" style={styles.outerButton}  onClick={this.offlineSession.bind(this)}>
                    </FlatButton>
                </CardActions>
                <CardActions>
                    <RaisedButton label="Go Back" style={styles.outerButton}  onClick={this.goBack.bind(this)} icon={<BackArrowIcon />}>
                    </RaisedButton>
                    <RaisedButton label="View Existing Sessions" style={styles.outerButton}  onClick={this.allSessions.bind(this)} icon={<DragIcon />}>
                    </RaisedButton>
                </CardActions>
            </Card>
        );
    }
};

export default NewSession;
