'use strict';

var React = require('react');
var ReactDOM = require('react-dom');

import { Router, Route, IndexRoute } from 'react-router';
import Loading from "./pages/Loading";

import browserHistory from './routes/history'

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import LoginForm from './pages/LoginForm'
import NewSession from './pages/NewSession';
import AllSessions from './pages/AllSessions';
import Epidemic from './canvas/Epidemic';
import Homepage from './pages/Homepage'

var Entry = React.createClass(
    {
  render: function(){
    return (

    <MuiThemeProvider>
      <Router history={ browserHistory }>
        <Route path='/' component={ Homepage }>
          <IndexRoute component={ LoginForm } />
          <Route path='new' component={ NewSession } />
          <Route path='all' component={ AllSessions } />
          <Route path='epidemic' component={ Epidemic } />
          <Route path='loading' component={ Loading } />

        </Route>
      </Router>
    </MuiThemeProvider>
    )
  }
});

if (typeof window !== 'undefined')
{
    ReactDOM.render(<Entry />, document.getElementById('app-container'));
}