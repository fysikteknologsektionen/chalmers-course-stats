import React from 'react';
import { Link } from 'react-router-dom';
import Footer from './Footer.js';


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

  async fetchInfoUpdateState(sortee, order, matchee, page) {
    const data = await this.fetchInfo(sortee, order, matchee, page);
    if (data.courses.length && data.metadata.length) {
      let tempState = this.state;
      tempState.data = data.courses;
      tempState.sort = sortee;
      tempState.desc = order;
      tempState.match = matchee;
      tempState.page = page;
      tempState.count = data.metadata[0].count;
      this.props.history.push('/stats/', tempState);
    }
  }

  async fetchInfo(sortee, order, matchee, page) {
    const response = await fetch(`${process.env.PUBLIC_URL}/courses?sort=${sortee}_${dict[order]}&search=${matchee}&page=${page}&items=${items_per_page}`);
    const json = await response.json();
    return json;
  }

  componentDidMount() {
    if (this.props.location.state) {
      this.setState(this.props.location.state);
    } else {
      this.fetchInfoUpdateState('courseCode', false, '', 0);
    }
    window.onpopstate = () => {
      this.setState(this.props.history.location.state);
    };
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
    this.fetchInfoUpdateState(sortee, order, this.state.match, this.state.page);
  }

  changePage(page) {
    this.fetchInfoUpdateState(this.state.sort, this.state.desc, this.state.match, page);
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
          <button onClick={ () => this.changePage(first-1) } className="pagination-link" aria-label="Page { first }" aria-current="page">{ first }</button>
        </li> }
      { prev - 1 > first &&
        <li>
        <span className="pagination-ellipsis">&hellip;</span>
        </li> }
      { prev > 0 &&
        <li>
        <button onClick={ () => this.changePage(prev-1) } className="pagination-link" aria-label="Page { prev }" aria-current="page">{ prev }</button>
        </li> }
        <li>
        <button className="pagination-link is-current" aria-label="Page { current }" aria-current="page">{ current }</button>
        </li>
      { next <= pages &&
        <li>
        <button onClick={ () => this.changePage(next-1) } className="pagination-link" aria-label="Page { this.state.page + 2 }" aria-current="page">{ next }</button>
        </li> }
      { next < pages-1 &&
        <li>
        <span className="pagination-ellipsis">&hellip;</span>
        </li> }
      { next < pages &&
        <li>
        <button onClick={ () => this.changePage(pages-1) } className="pagination-link" aria-label="Page { pages }" aria-current="page">{ pages }</button>
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
        this.fetchInfoUpdateState(this.state.sort, this.state.desc, query, 0);
      }, 10);
    };
    return (<input className="input" type="text" placeholder="Search" defaultValue={this.state.match} onChange={handleChange} />);
  }

  renderTableHeaderColumn(key, name) {
    return (<th onClick={() => this.sorter(key)} className={this.state.sort===key? (this.state.desc?'sorted-desc':'sorted-asc') :''}>{name}</th>);
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
        <span className="title is-1">Course statistics at Chalmers </span>
        <span className="title is-5 icon has-text-info">
          <i onClick={() => this.setState({ showInfo: true })} className="fas fa-info-circle"></i>
        </span>
        { this.renderInput() }
        <div className="tableContainer">
          <table className="table is-hoverable is-striped is-fullwidth">
            <thead>
              <tr>
                {this.renderTableHeaderColumn('courseCode', 'Code')}
                {this.renderTableHeaderColumn('courseName', 'Course')}
                {this.renderTableHeaderColumn('programShort', 'Program')}
                {this.renderTableHeaderColumn('passRate', <abbr title="Pass rate">PR</abbr>)}
                {this.renderTableHeaderColumn('totalPass', <abbr title="Number of passed results">P</abbr>)}
                {this.renderTableHeaderColumn('totalFail', <abbr title="Numer of failed results">F</abbr>)}
                {this.renderTableHeaderColumn('averageGrade', <abbr title="Average grade (3-5)">AG</abbr>)}
              </tr>
            </thead>
            <tbody>
              { this.state.data && this.state.data.map((e) => (
                <tr key={e.courseCode}>
                  <th><Link to={`/stats/${e.courseCode}/`} title={`View results for ${e.courseCode}`}>{e.courseCode}</Link></th>
                  <td><Link to={`/stats/${e.courseCode}/`} title={`View results for ${e.courseCode}`}>{e.courseName}</Link></td>
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
        <Footer />
      </div>);
  }
}
export default CourseList;
