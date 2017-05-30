import React from 'react';
import DrawingCanvas from './drawing/DrawingCanvas';

import Card from 'material-ui/Card';
import Subheader from 'material-ui/Subheader';

import Toolbar from "./toolbar/Toolbar";


class MainView extends React.Component{

    constructor(props) {
        super(props);
    }


    render() {

        return (
            <Card>
                <Subheader>Session: <b>{this.props.sessionName}</b></Subheader>
                <DrawingCanvas width={this.props.width} height={this.props.height} />
                <Toolbar />
            </Card>);
    }
};

export default MainView;
