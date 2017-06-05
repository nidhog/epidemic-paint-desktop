import React from 'react';

import {Card, CardActions} from 'material-ui/Card';
import Subheader from 'material-ui/Subheader';

import {List , ListItem} from 'material-ui/List';
import RaisedButton from 'material-ui/RaisedButton';
import BackArrowIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-left';

import browserHistory from '../routes/history';
import ListSession from './ListSession';

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

class AllSessions extends React.Component{
    constructor(props){
        super(props);
        this.listItems = null;
        this.artistID = null;
        this.state = {
            name: null,
            listItems: null,
        };
    }

    _addSession(){
        var listItems = null;
        const { search } = this.props.location;
        const artistID = this.artistID;

        fetch(
            sessionUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }).then( (json) => {
            if(json.status == 200 || json.status == 201 ){
                return json.json();

            }
            else{
                browserHistory.push('all');
            };

        }).then( (json) => {
            listItems = json.map((obj) =>
                <ListSession session={obj}/>
            );
            this.listItems = listItems;
            this.setState({listItems: listItems})


        }).catch( (ex) => {
                console.log('parsing failed', ex)
            })
    }


    goBack(){
        browserHistory.push('new/'+
        '?artistID='+this.artistID);
    }

    componentDidMount(){
        this._addSession();
    }


    render(){
        return (
        <div id="sessions-view">
            <Card>
                <Subheader>Connect to an existing session</Subheader>

                <List>{
                    this.state.listItems
                }
                </List>
                <CardActions>
                    <RaisedButton label="Go Back" style={styles.outerButton}  onClick={this.goBack.bind(this)} icon={<BackArrowIcon />}>
                    </RaisedButton>
                </CardActions>
            </Card>

        </div>
        );
    }
};

export default AllSessions;
