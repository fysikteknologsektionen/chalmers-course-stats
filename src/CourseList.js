import React from 'react';
import { Link } from 'react-router-dom';


const items_per_page = 20;
const dict = { true: 'desc', false: 'asc' };
class CourseList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      showInfo: false,
      page: 0,
      sort: 'courseCode',
      desc: false,
      match: '',
      count: 0,
    };
    this.timeout = 0;
  }

  fetchInfo(sortee, order, matchee, page) {
    fetch(`${process.env.PUBLIC_URL}/courses?sort=${sortee}_${dict[order]}&search=${matchee}&page=${page}&items=${items_per_page}`)
      .then(res => res.json())
      .then(data => data.courses.length && data.metadata.length && this.setState({ data: data.courses, sort: sortee, desc: order, match: matchee, page: page, count: data.metadata[0].count }));
  }

  componentDidMount() {
    this.fetchInfo('courseCode', false, '', 0);
  }

  sorter(sortee) {
    let order;
    if (sortee === this.state.sort) {
      order = !this.state.desc;
    } else {
      if (sortee === 'courseName' || sortee === 'courseCode' || sortee === 'programShort') {
        order = false;
      } else {
        order = true;
      }
    }
    this.fetchInfo(sortee, order, this.state.match, this.state.page);
  }

  changePage(page) {
    this.fetchInfo(this.state.sort, this.state.desc, this.state.match, page);
  }

  navigation() {
    let pages = this.state.count/items_per_page;
    let rest = this.state.count%items_per_page;
    if (rest > 0) {
      pages = Math.floor(pages+1);
    }
    let first = 1
    let prev = this.state.page;
    let current = this.state.page + 1;
    let next = this.state.page + 2;
    return (
      <nav className="pagination is-centered" role="navigation" aria-label="pagination">
        <ul className="pagination-list">
          { prev > first &&
              <li>
                <a onClick={ () => this.changePage(first-1) } className="pagination-link" aria-label="Page { first }" aria-current="page">{ first }</a>
              </li> }
          { prev - 1 > first &&
              <li>
                <span className="pagination-ellipsis">&hellip;</span>
              </li> 
          }
          { prev > 0 &&
              <li>
                <a onClick={ () => this.changePage(prev-1) } className="pagination-link" aria-label="Page { prev }" aria-current="page">{ prev }</a>
              </li> }
              <li>
                <a className="pagination-link is-current" aria-label="Page { current }" aria-current="page">{ current }</a>
              </li>
          { next <= pages &&
              <li>
                <a onClick={ () => this.changePage(next-1) } className="pagination-link" aria-label="Page { this.state.page + 2 }" aria-current="page">{ next }</a>
              </li> }
          { next < pages-1 &&
              <li>
                <span className="pagination-ellipsis">&hellip;</span>
              </li> }
          { next < pages &&
              <li>
                <a onClick={ () => this.changePage(pages-1) } className="pagination-link" aria-label="Page { pages }" aria-current="page">{ pages }</a>
              </li>
           }
            </ul>
          </nav>);
  }


  renderInput() {
    const handleChange = (event) => {
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
      const query = event.target.value;
      this.timeout = setTimeout(() => {
        this.fetchInfo(this.state.sort, this.state.desc, query, 0);
      }, 500);
    };
    return (<input className="input" type="text" placeholder="Search" onChange={handleChange} />);
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
        { this.renderInput() }
        <div className="tableContainer">
          <table className="table is-hoverable is-striped is-fullwidth">
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
                  <th><Link to={'/stats/' + e.courseCode} >{e.courseCode}</Link></th>
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
        </div>
        { this.navigation() }
      </div>);
  }
}
export default CourseList;
