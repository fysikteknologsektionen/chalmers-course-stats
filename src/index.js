import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import 'bulma/css/bulma.css';
import './index.css';
import Statistics from './Statistics';
import CourseList from './CourseList';

class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/stats/" component={CourseList} />
          <Route exact path="/stats/" component={Statistics} />
          <Route path="/stats/:initial/" component={Statistics} />
        </Switch>
      </BrowserRouter>
    );
  }
}


ReactDOM.render(<App width="2" />, document.getElementById('root'));
