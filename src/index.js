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
          <Route exact path="/" component={CourseList} />
          <Route exact path="/statistics/" component={Statistics} />
          <Route path="/statistics/:initial/" component={Statistics} />
        </Switch>
      </BrowserRouter>
    );
  }
}


ReactDOM.render(<App width="2" />, document.getElementById('root'));
