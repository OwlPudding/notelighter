import React from "react";
import { Button, Input } from "antd";

export default class Timestamps extends React.Component {
  state ={
    timestamps: []
  }
  render() {
    return (
      <div className="timestamps">
        
        {/* <ul>{ this.props.timestamps.map((stamp, i) => <li key={i}>{stamp.name} - {stamp.time}</li>) }</ul> */}
      </div>
    );
  }
}