import { ResponsiveContainer, ReferenceLine, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import React from 'react';

const defaults = {
  courseName: '-',
  programShort: '-',
  programLong: '-',
  passRate: '0',
  total: '0',
}
class Statistics extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expand: 'none',
      data: null,
      info: null,
    };
    this.handleChange = this.handleChange.bind(this);
  }

  fetchInfo(value) {
    Promise.all([
      fetch('/results/' + value).then(r => r.json()),
      fetch('/courses/' + value).then(r => r.json()),
    ]).then(([r1, r2]) => {
      this.setState({ data: r1, info: r2 });
    });
  }

  componentDidMount() {
    this.fetchInfo(this.props.match.params.initial);
  }

  handleChange(event) {
    const val = event.target.value;
    const regex = '^[a-zA-Z]{3}\\d{3}$';
    const match = val.match(regex);
    if (match) {
      this.fetchInfo(match[0]);
    }
  }

  renderInput(f) {
    return (<input className="input" type="text" placeholder="Course code" onChange={f} />);
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
              <p className="title"><abbr title={ infoRender.programLong }>{ infoRender.programShort }</abbr></p>
            </div>
          </div>
          <div className="level-item has-text-centered">
            <div>
              <p className="heading">Pass rate</p>
              <p className="title">{ Math.round(infoRender.passRate*1000)/10 }%</p>
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
          <input type="radio" name="setting" onClick={() => this.setState({ expand: 'none' })} defaultChecked={true} />
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
      </div>
    );
    return (
      <div className="container">
        { InfoBar }
        { this.renderInput(this.handleChange) }
        { radio }
        { this.state.data &&
            <ResponsiveContainer width="90%" height={Math.max(Object.keys(this.state.data).length * 30, 300)}>
              <BarChart
                data={this.state.data}
                layout="vertical"
                margin={{ top: 20, right: 0, left: 40, bottom: 5 }}
                stackOffset={this.state.expand}
                label="type"
              >
                <XAxis type="number" orientation="top" />
                <YAxis type="category" tickLine={false} dataKey="date" />
                <Tooltip />
                <Legend />
                <Bar barSize={10} dataKey="U" stackId="a" fill="#e6550d" />
                <Bar barSize={10} dataKey="3" stackId="a" fill="#a1d99b" />
                <Bar barSize={10} dataKey="G" stackId="a" fill="#a1d99b" />
                <Bar barSize={10} dataKey="TG" stackId="a" fill="#a1d99b" />
                <Bar barSize={10} dataKey="4" stackId="a" fill="#74c476" />
                <Bar barSize={10} dataKey="5" stackId="a" fill="#31a354" />
                { this.state.expand === 'silhouette' &&
                    <ReferenceLine x="0" stroke="black" isFront label="Median"/>
                }
              </BarChart>
            </ResponsiveContainer>}
          </div>
    );
  }
}
// <Bar barSize={10} dataKey="VG" stackId="a" fill="#31a354" />

export default Statistics;
