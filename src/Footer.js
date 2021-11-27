import React from 'react';

class Footer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      updatedAt: "0"
    };
  }

  componentDidMount() {
    Promise.all([
      fetch(`${process.env.PUBLIC_URL}/latestUpdate`).then(res => res.json())
    ]).then(([r1]) => {
      let d = new Date(r1.updatedAt).toDateString();

      this.setState({
        updatedAt: d
      });
    });
  }


  render() {
    return (
      <footer>
        <p>
          <a href="https://github.com/Fysikteknologsektionen/chalmers-course-stats" target="_blank" rel="noopener noreferrer" title="GitHub Repository"><i className="fab fa-github"></i> GitHub</a> | <a href="https://github.com/Fysikteknologsektionen/chalmers-course-stats/blob/master/API.md" target="_blank" rel="noopener noreferrer">API</a>
        </p>
        <p>Database last updated {this.state.updatedAt}</p>
        <p>© {(new Date()).getFullYear()} Fysikteknologsektionen</p>
      </footer>
    );
  }
}

export default Footer;
