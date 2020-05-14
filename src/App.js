import React from 'react';
import './App.css';

import Dropzone from "react-dropzone";
import { Button, Input } from "antd";

import DocViewer from "./components/DocViewer";

export default class App extends React.Component {
  state = {
    screen: "select", //"editor", "playback"
    files: [],
    timestamps: [],
    bpm: null
  };
  rehearse = (selections, prevPage, nextPage, numPages, pageNumber) => {
    const { timestamps } = this.state;

    const duration = this.audio.duration;
    let god = {};
    /*
    1: { start: tp1, duration: tp2 - tp1, nm: number of measures, ml: measure length,  }
    */
    // console.log(selections);
    for (let i = 0; i < numPages; i++) {
      if (timestamps[i]) {
        const godentry = i+1;
        god[godentry] = {
          start: timestamps[i].time,
          duration: (timestamps[i+1] === undefined) ? duration - timestamps[i].time : timestamps[i+1].time - timestamps[i].time,
          //nm: number of measures, ml: measure length
          groups: []
        };

        if (selections[i+1].length) {
          let sum = 0;
          //let group
          let groups = selections[i+1].map((item, i) => {
            const x = item.props.style.left;
            const y = item.props.style.top;
            const m = parseInt(item.props.children.props.children);
            sum += m;

            return { x: x, y: y, nm: m, start: null };
            // console.log(`Group ${i+1}: ${m} measures`);
          });
          console.log('GROUPS:', groups);
          // console.log(`Page 1 has ${sum} measures in total`);
          god[godentry].nm = sum;
          god[godentry].ml = god[godentry].duration / sum;
          let nextStart = god[godentry].start;
          groups.forEach((item, i) => {
            nextStart += (i === 0) ? 0 : item.nm * god[godentry].ml;
            item.start = nextStart;
            // return item;
            // console.log({ ...item, start: nextStart });
            // return { ...item, start: nextStart };
            // console.log(`Group ${i+1}: ${m} measures`);
          });
          god[godentry].groups = groups;
          // god[godentry].groups.push(group);
        }
      }
    }
    // console.log(`${pageNumber} of ${numPages}`);
    // console.log(god);

    this.audio.currentTime = 0;
    let godArray = Object.keys(god).map((key, i) => {
      let row = [];
      row.push(god[key].start);
      god[key].groups.forEach(group => row.push({x: group.x, y: group.y, start: group.start}));
      // console.log(row);
      return row;
    });
    // console.log(godArray.flat());
    godArray = godArray.flat();

    let i = 0;
    const self = this;
    document.getElementById("audio").ontimeupdate = function() {
      const time = self.audio.currentTime;
      document.querySelectorAll(".rectangle").forEach(rect => rect.children[0].style.color = "transparent");
      if (godArray[i]) {
        if (godArray[i].y) {
          if (time >= godArray[i].start) {
            window.scrollTo( parseInt(godArray[i].x), parseInt(godArray[i].y) );
            i++;
          }
          // console.log("NEXT:",i, godArray[i]);
        } else {
          if (time >= godArray[i]) {
            if (i !== 0) nextPage();
            i++;
            // console.log("NEXT", i, godArray[i]);
          }
        }
      }
    };
    // console.log(god[1].groups[0]);
    // window.scrollTo(parseInt(god[1].groups[0].x), parseInt(god[1].groups[0].y));
    this.audio.play();
    // while (this.audio.currentTime !== duration) {
    //   console.log("playing");
    // }
  }
  render() {
    if (this.state.screen === "select") {
      return (
        <div className="App select">
          <h1 className="title">NoteLight</h1>
          <Dropzone onDrop={acceptedFiles => {
            this.setState({ files: [...(this.state.files || []), ...acceptedFiles ] });
          }}>
            {({getRootProps, getInputProps}) => (
              <section className="dropzone-container">
                <div {...getRootProps()} className="dropzone">
                  <input {...getInputProps()} />
                  <p>Drag 'n' drop some files here, or click to select files</p>
                </div>
                <aside>
                  <h3>Files:</h3>
                  <ul>{this.state.files.map(file => <li key={file.name}>{file.name}</li>)}</ul>
                </aside>
              </section>
            )}
          </Dropzone>
          <Button
            onClick={() => this.setState({ screen: "editor" })}
            className={`continue-button${this.state.files.length >= 2 ? "" : " disabled"}`}>Continue</Button>
        </div>
      );
    } else if (this.state.screen === "editor") {
      const notes = this.state.files.find(file => file.type === "application/pdf");
      const audio = this.state.files.find(file => file.type === "audio/mpeg");

      return ( //<DocViewer notes={notes} audio={audio} />
        <div className="App editor">
          <div className="player-container">
            <audio ref={(audio) => { this.audio = audio }} className="guide-mp3" id="audio"
              src={URL.createObjectURL(audio)} controls type="audio/mpeg" />
            <Input placeholder="Timestamp name..." ref={(timename) => { this.timename = timename }} style={{ width: "15%" }} />
            <Button onClick={() => {
              this.setState({ timestamps: [...(this.state.timestamps || []), {
                name: this.timename.state.value,
                time: this.audio.currentTime
              }] });
            }}>Add timestamp</Button>
            <Input placeholder="bpm..." ref={(bpm) => { this.bpm = bpm}} style={{ width: "15%", marginLeft: 15 }} />
            <Button onClick={() => this.setState({ bpm: this.bpm.state.value })} style={{ marginRight: 15 }}>Add bpm</Button> { this.state.bpm ? `Set to ${this.state.bpm} bpm` : "" }
            <ul className="timestamps">{ this.state.timestamps.map((stamp, i) => <li key={i}>{stamp.name} - {stamp.time}</li>) }</ul>
          </div>

          <DocViewer notes={notes} sendData={this.rehearse} />
        </div>
      );
    } else if (this.state.screen === "playback") {
      return <h1>Playback</h1>;
    } else return "";
  };
};