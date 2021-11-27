import React from 'react';

class Notice extends React.Component {
  static hidden = false;

  render() {
    return (
      <div className={'notification is-success' + (Notice.hidden ? ' is-hidden' : '')}>
        <button className="delete" onClick={this.hideNotice}></button>
        <p>We're back up and running! The latest exams should be available now.
          However, there are still some results missing from 2019, 2020 and early 2021 which are being looked into if they can be obtained.
        </p>
      </div>
    );
  }

  hideNotice = () => {
    Notice.hidden = true;
    this.forceUpdate();
  }
}

export default Notice;
