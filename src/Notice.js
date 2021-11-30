import React from 'react';

class Notice extends React.Component {
  static hidden = false;

  render() {
    return (
      <div className={'notification is-success' + (Notice.hidden ? ' is-hidden' : '')}>
        <button className="delete" onClick={this.hideNotice}></button>
        <p>We're back up and running! All exams should be available now!</p>
      </div>
    );
  }

  hideNotice = () => {
    Notice.hidden = true;
    this.forceUpdate();
  }
}

export default Notice;
