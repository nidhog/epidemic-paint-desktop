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
        const sessionName = getParams('sessionName', search);
        const artistID = getParams('artistID', search);
        return (
            <MainView width={ defaultSettings.width } height={ defaultSettings.height }
                      sessionName = {sessionName} artistID={artistID}>
            </MainView>);
    }
};

export default Epidemic;
