import React from "react";
import { Button, Input } from "antd";

export default class Player extends React.Component {
  state = {
    timestamps: []
  };
  render() {
    return (
      <div className="player">
        
        {/* <ul>{ this.state.timestamps.map((stamp, i) => <li key={i}>{stamp.name} - {stamp.time}</li>) }</ul> */}
      </div>
    );
  }
};