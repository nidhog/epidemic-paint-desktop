import React from 'react';

import {Card, CardActions} from 'material-ui/Card';
import FlatButton from "material-ui/FlatButton";
import browserHistory from '../../routes/history'

const styles = {
    logoutButton: {
        verticalAlign: 'right',
    }
};

class MainView extends React.Component{
    constructor(props){
        super(props);
    }
    logout(){
        browserHistory.push('/');
    }


    render() {
        return (
            <Card>


                <CardActions>
                    <FlatButton label="Log Out" style={styles.logoutButton} onClick={this.logout.bind(this)}>
                    </FlatButton>
                </CardActions>
            </Card>);
    }
};

export default MainView;
