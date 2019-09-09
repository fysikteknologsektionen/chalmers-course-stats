import React from 'react';

class Notice extends React.Component {
  static hidden = false;

  render() {
    return (
      <div className={'notification is-warning'+( Notice.hidden ? ' is-hidden':'')}>
        <button className="delete" onClick={this.hideNotice}></button>
        <p>Chalmers has stopped publishing the course results file which is needed for updates.
        For more information, visit <a href="https://github.com/Fysikteknologsektionen/chalmers-course-stats/issues/39" rel="noopener noreferrer">this issue on GitHub</a>.
        We are currently looking into other ways of obtaining this information.
        Note, however, that you can still browse the old results.
        Thank you for your patience.</p>
      </div>
      );
    }
    
    hideNotice = () => {
      Notice.hidden = true;
      this.forceUpdate();
    }
  }
  
  export default Notice;
  