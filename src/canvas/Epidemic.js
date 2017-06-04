import React from 'react';

import MainView from "./MainView";

import getParams from '../utils/parsing'

const defaultSettings = {
    width : 800,
    height : 500,
}

class Epidemic extends React.Component{
    constructor(props){
        super(props);
    }

    render() {
        const { search } = this.props.location;
        console.log(search)
        const sessionName = getParams('sessionName', search);
        const sessionID = getParams('sessionID', search);
        const artistID = getParams('artistID', search);
        return (
            <MainView width={ defaultSettings.width }
                      height={ defaultSettings.height }
                      sessionName = {sessionName}
                      sessionID = {sessionID}
                      artistID={artistID}>
            </MainView>);
    }
};

export default Epidemic;
