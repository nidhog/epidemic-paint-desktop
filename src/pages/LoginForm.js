import React from 'react';

import TextField from 'material-ui/TextField';

import {Card, CardActions} from 'material-ui/Card';
import Subheader from 'material-ui/Subheader';

import FlatButton from 'material-ui/FlatButton';

import browserHistory from '../routes/history';

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

const artistsUrl = 'http://webcanva.herokuapp.com/canvas/api/v1/artists/'

class LoginForm extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            firstname : null,
            lastname : null,
            email : null,
        }
    }

    _addUser(){
        fetch(
            artistsUrl, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    first_name: this.state.firstname,
                    last_name: this.state.lastname,
                    email: this.state.email,
                })
            }).then( (json) => {
                if(json.status == 200 || json.status == 201 ){
                    return json.json();

                }
                else{
                    browserHistory.push('/');
                };

            }).then((json)=> {
            console.log(json);
            browserHistory.push('new/'+
                '?artistID='+json.id);
        }).catch( (ex) => {
                console.log('parsing failed', ex)
            })
    }
    _newLogin(){
        browserHistory.push('loading');
        this._addUser();
    }

    // TODO : change later to search for only one artist by email in the backend
    getArtistID(email, artists, searchField = "email", getField="id"){
        for (var i=0 ; i < artists.length ; i++)
        {
            if (artists[i][searchField] == email) {
                return artists[i][getField];
            }
        }
    }

    _logExistingUser(){
        fetch(
            artistsUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            }).then( (response) => {
            if(response.status == 200 || response.status == 201 ){
                return response.json();

            }
            else{
                browserHistory.push('/');
            };

        }).then((artist_list)=> {
            var artistID = this.getArtistID(this.state.email, artist_list);
            if(artistID == null){
                browserHistory.push('/');
                alert('Artist not found');
            }
            else{
                browserHistory.push('new/'+
                    '?artistID='+artistID);
            }
        }).catch( (ex) => {
            console.log('parsing failed', ex)
        });
    }

    _login(){
        browserHistory.push('loading');
        this._logExistingUser();
    }

    updateFirstname(event, firstname){
        this.setState({firstname: firstname});
    }
    updateLastname(event, lastname){
        this.setState({lastname: lastname});
    }
    updateEmail(event, email){
        this.setState({email: email});
    }

    render(){
        return (

            <Card>
                <Subheader>Login</Subheader>
                <TextField floatingLabelText="First Name"
                           value={this.state.firstname}
                           onChange={ this.updateFirstname.bind(this)} /><br/>
                <TextField floatingLabelText="Last Name"
                           value={this.state.lastname}
                           onChange={ this.updateLastname.bind(this)}></TextField><br/>
                <TextField floatingLabelText="Email Address"
                           value={this.state.email}
                           onChange={ this.updateEmail.bind(this)}></TextField><br/>
                <CardActions>
                    <FlatButton label="New Artist" style={styles.outerButton}  onClick={this._newLogin.bind(this)}>
                    </FlatButton>
                    <FlatButton label="Returning Artist" style={styles.outerButton}  onClick={this._login.bind(this)}>
                    </FlatButton>
                </CardActions>
            </Card>
        );
    }
};

export default LoginForm;
