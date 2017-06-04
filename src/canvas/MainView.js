import React from 'react';
import DrawingCanvas from './drawing/DrawingCanvas';

import Card from 'material-ui/Card';
import Subheader from 'material-ui/Subheader';

import Toolbar from "./toolbar/Toolbar";


class MainView extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            sessionName: 'Untitled'
        }
    }

    renameSessionName(name, ignoreNullString=false){
        if(!ignoreNullString){
            if(name !== null && name !== 'null' ){
                this.setState({ sessionName: name})
            }
        }
        else{
            if(name !== null){
                this.setState({ sessionName: name})
            }
        }
    }

    componentWillMount(){
        this.renameSessionName(this.props.sessionName);
    }
    render() {
        console.log(this.props.artistID);
        console.log(this.props.sessionID);
        return (
            <Card>
                <Subheader>Session Name: <b>{this.state.sessionName}</b></Subheader>
                <DrawingCanvas width={this.props.width} height={this.props.height}
                                artistID = {this.props.artistID}
                                sessionID = {this.props.sessionID}
                />
                <Toolbar />
            </Card>);
    }
};

export default MainView;
