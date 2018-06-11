import React from 'react';
import { Link } from 'react-router-dom';


const dict = { true: 'desc', false: 'asc' };
class CourseList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      showInfo: false,
      sort: 'courseName',
      desc: false,
    };
  }

  fetchInfo(sortee, order) {
    fetch('/courses?sort=' + sortee + '_' + dict[order])
      .then(res => res.json())
      .then(data => this.setState({ data: data, sort: sortee, order: order }));
  }

  componentDidMount() {
    this.fetchInfo('courseName', false);
  }

  sorter(sortee) {
    let order;
    if (sortee === this.state.sort) {
      order = !this.state.order;
    } else {
      order = false;
    }
    this.fetchInfo(sortee, order);
  }

  render() {
    return (
      <div className="container">
        <div id="info" className={ this.state.showInfo ? 'modal is-active' : 'modal' }>
          <div className="modal-background"></div>
          <div className="modal-content has-text-white">
            Inspirerad av <a href="http://tenta.bowald.se">Bowalds sida</a>. Den inkluderar alla rapporterade resultat. Därför syns även projektbaserade kurser och examensarbeten. Sidan skalar också vertikalt så att resultaten är lika läsbara för kurser som funnits längre. TG betyder tillgodoräknad kurs om man t.ex. studerat på en annan skola kan man tillgodoräkna en motsvarade kurs.
          </div>
          <button onClick={() => this.setState({ showInfo: false })} className="modal-close is-large" aria-label="close"></button>
        </div>
        <span className="title is-1">Courses</span>
        <span className="title is-5 icon has-text-info">
          <i onClick={() => this.setState({ showInfo: true })} className="fas fa-info-circle"></i>
        </span>
        <table className="table is-hoverable is-striped">
          <thead>
            <tr>
              <th onClick={() => this.sorter('courseCode')}>Code</th>
              <th onClick={() => this.sorter('courseName')}>Course</th>
              <th onClick={() => this.sorter('programShort')}>Program</th>
              <th onClick={() => this.sorter('passRate')}><abbr title="Pass rate">PR</abbr></th>
              <th onClick={() => this.sorter('totalPass')}><abbr title="Number of passed results">P</abbr></th>
              <th onClick={() => this.sorter('totalFail')}><abbr title="Numer of failed results">F</abbr></th>
              <th onClick={() => this.sorter('averageGrade')}><abbr title="Average grade (3-5)">AG</abbr></th>
            </tr>
          </thead>
          <tbody>
            { this.state.data && this.state.data.map((e) => (
              <tr key={e.courseCode}>
                <th><Link to={'/statistics/' + e.courseCode}>{e.courseCode}</Link></th>
                <td>{e.courseName}</td>
                <td><abbr title={e.programLong}>{e.programShort}</abbr></td>
                <td>{Math.round(e.passRate * 1000) / 10}</td>
                <td>{e.totalPass}</td>
                <td>{e.totalFail}</td>
                <td>{Math.round(e.averageGrade * 10) / 10}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>);
  }
}
export default CourseList;
