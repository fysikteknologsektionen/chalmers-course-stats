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

class Statistics extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expand: 'none',
      data: null,
      info: null,
      exams: true,
      stack: true,
    };
  }

  componentDidMount() {
    this.fetchInfo(this.props.match.params.initial);
    window.onpopstate = () => {
      this.setState(this.props.history.location.state);
    };
  }

  percentScore(value,payload) {
    let scores = [payload['U'],payload['G'],payload['TG'], payload[3], payload[4], payload[5]];
    return Math.round(100*(value/(scores.reduce((a, b) => a + b, 0))))+'%';
  }

  fetchInfo(value) {
    Promise.all([
      fetch(process.env.PUBLIC_URL+'/results/' + value).then(r => r.json()),
      fetch(process.env.PUBLIC_URL+'/courses/' + value).then(r => r.json()),
    ]).then(([r1, r2]) => {
      this.props.history.replace(`/stats/${value}/`, { data: r1, info: r2 })
      this.setState({ data: r1, info: r2 });
    });
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
        <label className="radio">
          <input type="radio" name="setting" onClick={() => this.setState({ expand: 'none' })} defaultChecked />
          Standard
        </label>
        <label className="radio">
          <input type="radio" name="setting" onClick={() => this.setState({ expand: 'silhouette' })} />
          Median
        </label>
        <label className="radio">
          <input type="radio" name="setting" onClick={() => this.setState({ expand: 'expand' })} />
          Normalized
        </label>
        <label className="radio">
          <input type="radio" name="stacked" onClick={() => this.setState({ stack: true })} defaultChecked />
          <span class="icon">
            <i class="fas fa-pause"></i>
          </span>
        </label>
        <label className="radio">
          <input type="radio" name="stacked" onClick={() => this.setState({ stack: false })} />
          <span class="icon">
            <i class="fas fa-align-left"></i>
          </span>
        </label>
      </div>
    );

    const grades = ['U', '3', 'G', 'TG', '4', '5'];
    const colors = {'U': 'hsl(20, 90%, 40%)', '3': 'hsl(100, 60%, 80%)', 'G': 'hsl(100, 60%, 80%)', 'TG': 'hsl(100, 60%, 80%)', '4': 'hsl(100, 60%, 60%)', '5': 'hsl(100, 60%, 40%)'};    


    let heightFactor = 1;
    if (!this.state.stack) {
      heightFactor = 3;
    }
    return (
      <div className="container">
        { this.renderInput(this.handleChange) }
        { InfoBar }
        { radio }
        { this.state.info && this.state.data &&
          <ResponsiveContainer width="100%" height={Math.max(Object.keys(this.state.data).length * 40 * heightFactor, 300)}>
            <BarChart
              data={this.state.data}
              layout="vertical"
              margin={{ top: 20, right: 40, left: 40, bottom: 5 }}
              stackOffset={this.state.expand}
              label="type"
            >
              <XAxis type="number" orientation="top" />
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
