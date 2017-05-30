require('../../less/main.less');

import React from 'react';

import AppBar from "material-ui/AppBar";
import IconButton from 'material-ui/IconButton';
import BrushIcon from 'material-ui/svg-icons/image/brush';


class Homepage extends React.Component{

    render() {
        return (
            <div className="myDiv">

                <AppBar
                    title="Epidemic Paint"
                    iconClassNameRight="muidocs-icon-navigation-expand-more"
                    iconElementLeft={<IconButton><BrushIcon/></IconButton>}
                />
                { this.props.children }
                <footer>
                </footer>

            </div>
        );
    }
}

export default Homepage;