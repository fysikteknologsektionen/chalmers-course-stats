import { ResponsiveContainer, ReferenceLine, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LabelList } from 'recharts';
import React from 'react';
import Footer from './Footer.js';

const defaults = {
  courseName: '-',
  programShort: '-',
  programLong: '-',
  averageGrade: '0',
  passRate: '0',
  total: '0',
};
const grades = ['U', '3', 'G', 'TG', '4', '5'];
const colors = {'U': 'hsl(20, 90%, 40%)', '3': 'hsl(100, 60%, 80%)', 'G': 'hsl(100, 60%, 80%)', 'TG': 'hsl(100, 60%, 80%)', '4': 'hsl(100, 60%, 60%)', '5': 'hsl(100, 60%, 40%)'};    

class Statistics extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expand: 'none',
      data: null,
      info: null,
      exams: true,
      stack: true,
      misc: true,
        };
    }

    componentDidMount() {
      this.fetchInfo(this.props.match.params.initial);
      window.onpopstate = () => {
        this.setState(this.props.history.location.state);
      };
    }

    percentScore(value, payload) {
      let total = grades.reduce(((acc, grade) => { return acc + payload[grade]; }), 0);
      return Math.round(100*(value/total))+'%';
    }

    fetchInfo(value) {
      Promise.all([
        fetch(`${process.env.PUBLIC_URL}/results/${value}`).then(r => r.json()),
        fetch(`${process.env.PUBLIC_URL}/courses/${value}`).then(r => r.json()),
      ]).then(([r1, r2]) => {
        this.props.history.replace(`/stats/${value}/`, { data: r1, info: r2 })
        this.setState({ data: r1, info: r2 });
      });
    }

    downloadData(value) {
      fetch(`${process.env.PUBLIC_URL}/results/${value}`)
      .then(r => r.json())
      .then(json => json.map(result => [result.date,result.type,result[3],result[4],result[5],result.G,result.VG,result.TG].join(',')))
      .then(csv => 'Date,Type,U,3,4,5,G,VG,TG\r\n' + csv.join('\r\n'))
      .then(data => this.downloadCSV(data, value))
    }

    downloadCSV(data, fileName) {
      var hiddenElement = document.createElement('a');
          hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(data);
          hiddenElement.target = '_blank';
          hiddenElement.download = `${fileName}.csv`;
          hiddenElement.click();
          hiddenElement.remove();
    }

    renderBackButton() {
      if (this.props.history.length > 2) {
        return (<button id="all-courses" onClick={this.props.history.goBack}>&larr; All courses</button>);
      } else {
        return (<a id="all-courses" href={process.env.PUBLIC_URL+'/'}>&larr; All courses</a>);
      }
    }

    renderDownloadButton() {
      return (<button id="download-csv" title="Download a CSV file of unfiltered data" className="button is-small is-link is-outlined" onClick={() => this.downloadData(this.props.match.params.initial.toUpperCase())}>Download CSV</button>);
    }

    renderInput() {
      const handleChange = (event) => {
        const val = event.target.value;
        const regex = '^[a-zA-Z]{3}\\d{3}$';
        const match = val.match(regex);
        if (match) {
          this.fetchInfo(match[0])
        }
      };
      return (<input className="input" type="text" placeholder="Course code" onChange={handleChange} />);
    }

    render() {
      let infoRender = {};
      if (this.state.info) {
        infoRender = this.state.info;
      } else {
        infoRender = defaults;
      }
      const InfoBar = (
        <div>
          <nav className="level">
            <div className="level-item has-text-centered">
              <div>
                <p className="heading">Course</p>
                <p className="title">{ infoRender.courseName }</p>
              </div>
            </div>
          </nav>
          <nav className="level">
            <div className="level-item has-text-centered">
              <div>
                <p className="heading">Program name</p>
                <p className="title"><abbr title={infoRender.programLong}>{ infoRender.programShort }</abbr></p>
              </div>
            </div>
            <div className="level-item has-text-centered">
              <div>
                <p className="heading">Pass rate</p>
                <p className="title">{ Math.round(infoRender.passRate * 1000)/10 }%</p>
              </div>
            </div>
            <div className="level-item has-text-centered">
              <div>
                <p className="heading">Average grade</p>
                <p className="title">{ Math.round(infoRender.averageGrade*100)/100 }</p>
              </div>
            </div>
            <div className="level-item has-text-centered">
              <div>
                <p className="heading">Total number of results</p>
                <p className="title">{ infoRender.total }</p>
              </div>
            </div>
          </nav>
        </div>
      );
      const radio = (
        <div className="control">
          <div className="control-group">
            <label className="radio" title="Stacked">
              <input type="radio" name="stacked" onClick={() => this.setState({ stack: true })} defaultChecked />
              <span className="icon">
                <i className="fas fa-bars"></i>
              </span>
            </label>
            <br></br>
            <label className="radio" title="Unstacked">
              <input type="radio" name="stacked" onClick={() => {
                let expand = this.state.expand
                if (this.state.expand === 'silhouette') {
                  expand = 'none';
                }
                this.setState({ stack: false, expand: expand });
              }} />
              <span className="icon">
                <i className="fas fa-align-left"></i>
              </span>
            </label>
          </div>
          <div className="control-group">
            <label className="radio">
              <input type="radio" name="setting" checked={this.state.expand === 'none'} onChange={() => this.setState({ expand: 'none' })} />
              Standard
            </label>
            <br></br>
            <label className="radio">
              <input type="radio" name="setting" checked={this.state.expand === 'expand'} onChange={() => this.setState({ expand: 'expand' })} />
              Normalized
            </label>
            <br></br>
            <label className="radio">
              <input type="radio" name="setting" disabled={!this.state.stack} checked={this.state.expand === 'silhouette'} onChange={() => this.setState({ expand: 'silhouette' })} />
              Median
            </label> 
            <br></br>
          </div>
          <div className="control-group">
            { this.renderDownloadButton() }
            <br></br>
            <label className="checkbox">
              <input type="checkbox" defaultChecked={this.state.exams} onClick={() => this.setState({ exams: !this.state.exams })}/>
              Show exams
            </label>
            <br></br>
            <label className="checkbox">
              <input type="checkbox" defaultChecked={this.state.misc} onClick={() => this.setState({ misc: !this.state.misc })}/>
              Show misc
            </label>
          </div>
        </div>
      );


      let heightFactor = 1;
      if (!this.state.stack) {
        heightFactor = 3;
      }
      let filtered = [];
      if (this.state.data) {
        if (this.state.exams && this.state.misc) {
          filtered = this.state.data;
        } else if (this.state.exams || this.state.misc) {
          let bool = (item) => item.type.includes('Tentamen');
          if (this.state.misc) {
            bool = (item) => !item.type.includes('Tentamen');
          }
          filtered = this.state.data.filter(bool);
        }
        if (this.state.expand === 'expand' && !this.state.stack) {
          filtered = filtered.map(item => {
            let total = grades.reduce(((acc, grade) => {return acc+item[grade]}), 0);
            let it = Object.assign({}, item);
            grades.forEach(grade => {
              it[grade] /= total;
            });
            return it;
          });
        }
      }
      return (
        <div className="container">
          { this.renderBackButton() }
          { this.renderInput(this.handleChange) }
          { InfoBar }
          { radio }
          { this.state.info && filtered &&
              <ResponsiveContainer width="100%" height={Math.max(Object.keys(filtered).length * 40 * heightFactor, 300)}>
                <BarChart
                  data={filtered}
                  layout="vertical"
                  margin={{ top: 20, right: 40, left: 40, bottom: 5 }}
                  stackOffset={this.state.expand}
                  label="type"
                >
                  <XAxis type="number" orientation="top"/>
                  <YAxis type="category" tickLine={false} dataKey="date" />
                  <Tooltip itemSorter={()=>1} formatter={(value,name,props) => (this.state.expand==='expand'? this.percentScore(value, props.payload) : value) } />
                  <Legend />
                  { grades.map(grade =>
                    this.state.info[grade] > 0 &&
                    <Bar key={grade} barSize={20} dataKey={grade} {... (this.state.stack ? {stackId: 'a'} : {})} fill={colors[grade]}>
                      <LabelList
                        fontSize={10}
                        valueAccessor={x => (x.width>20 ? (this.state.expand==='expand' ? this.percentScore(x[grade], x.payload) : x[grade]) : null)}
                        position="center" />
                    </Bar>
                  )}
                  { this.state.expand === 'silhouette' &&
                      <ReferenceLine x="0" stroke="black" isFront strokeDasharray="3 3" />
                  }
                </BarChart>
              </ResponsiveContainer>}
              <Footer />
            </div>
      );
    }
}

export default Statistics;
