import React from "react";
import { Button, Input } from "antd";
import { Document, Page } from 'react-pdf/dist/entry.webpack';

export default class DocViewer extends React.Component {
  constructor(props) {
    super(props);
    this.controls = [
      { name: "Measure", color: "#65F2D55E" },
      { name: "Rest", color: "#EF626C5E" },
      { name: "Repeat", color: "#FFE8A25E" },
      { name: "Other", color: "#76C3D55E" }
    ];
    this.state = {
      numPages: null,
      pageNumber: 1,
      selected: this.controls[0],
      selections: null,
      timestamps: []
    };
    this.onDocumentLoadSuccess = this.onDocumentLoadSuccess.bind(this);
  }
  
  async onDocumentLoadSuccess (e) {
    const numPages = e._pdfInfo.numPages;
    let temp = {};
    for (let i = 0; i < numPages; i++) temp[i+1] = [];
    await this.setState({
      numPages: numPages,
      selections: temp
    });
    this.initDraw(document.getElementById('canvas'));
  }
  initDraw = canvas => {
    const self = this;
    const pos = document.querySelector("#canvas").getBoundingClientRect();
    let rectCount = self.state.selections[self.state.pageNumber].length;
    let mouse = {
      x: 0,
      y: 0,
      startX: 0,
      startY: 0
    };
    let element = null;

    function setMousePosition(e) {
      const ev = e || window.event; //Moz || IE
      if (ev.pageX) { //Moz
        mouse.x = ev.pageX - pos.x;
        mouse.y = ev.pageY - pos.y;
      } else if (ev.clientX) { //IE
        mouse.x = ev.clientX - pos.x;
        mouse.y = ev.clientY - pos.y;
      }
    };
    canvas.onmousemove = function (e) {
      setMousePosition(e);
      if (element !== null && element.children.length === 0) {
        element.style.width = Math.abs(mouse.x - mouse.startX) + 'px';
        element.style.height = Math.abs(mouse.y - mouse.startY) + 'px';
        element.style.left = (mouse.x - mouse.startX < 0) ? mouse.x + 'px' : mouse.startX + 'px';
        element.style.top = (mouse.y - mouse.startY < 0) ? mouse.y + 'px' : mouse.startY + 'px';
      }
    }
    canvas.onclick = function (e) {
      rectCount = self.state.selections[self.state.pageNumber].length;

      if (e.target.className === "measure-count") {
      } else if (element !== null) {
        let mc = document.createElement("input");
        mc.type = "number";
        mc.className = "measure-count";
        let el = element;
        
        element.appendChild(mc);
        mc.focus();

        mc.onblur = function(e) {
          if (this.value === "") { //User didn't enter a measure count
            canvas.removeChild(el);
          }
          else { //Finished
            const relem = <div className="rectangle" style={{
              backgroundColor: element.style.backgroundColor,
              width: element.style.width,
              height: element.style.height,
              left: element.style.left,
              top: element.style.top
            }} id={rectCount} key={`${rectCount++}_${this.value}`}>
              <h1>{this.value}</h1>
            </div>;
          
            let selections = self.state.selections;
            selections[self.state.pageNumber].push(relem);
            self.setState({ selections: selections });
            canvas.removeChild(el);
          }
          
          element = null;
        };
        mc.addEventListener("keyup", function(e) {
          if (e.keyCode === 13) {
            this.blur();
          }
        });
        
        canvas.style.cursor = "default";
      }
      else { //Begin
        mouse.startX = mouse.x;
        mouse.startY = mouse.y;

        element = document.createElement('div');
        element.className = 'rectangle';
        element.setAttribute("id", rectCount++);
        element.style.left = mouse.x + 'px';
        element.style.top = mouse.y + 'px';
        element.style.backgroundColor = self.state.selected.color;

        canvas.appendChild(element);
        
        canvas.style.cursor = "crosshair";
      }
    }
    canvas.oncontextmenu = function(e) {
      if (e.target.className === "rectangle") {
        let selections = self.state.selections;
        selections[self.state.pageNumber].splice(e.target.id, 1);
        self.setState({ selections: selections });
      } else if (e.target.className === "measure-count") {
        e.target.blur();
      }
      return false;
   }
  }
  prevPage = () => {
    this.setState({ pageNumber: this.state.pageNumber - 1 <= 1 ? 1 : this.state.pageNumber - 1 })
  }
  nextPage = () => {
    this.setState({ pageNumber: this.state.pageNumber + 1 >= this.state.numPages ? this.state.numPages : this.state.pageNumber + 1});
  }
  render() {
    return (
      <div className="doc-viewer">
        <div className="controls">
          <div className="music-element-container">
            { this.controls.map((control, i) => (
              <div key={i} className="music-element" style={{ flex: 1, backgroundColor: control.color }} onClick={() => this.setState({ selected: control })}>
                {control.name}
              </div>
            )) }
          </div>
          <div>
            <Button onClick={() => {
              this.props.sendData(this.state.selections, this.prevPage, this.nextPage, this.state.numPages, this.state.pageNumber);
            }}
              style={{ position: "absolute", top: 75, color: "maroon" }}>REHEARSE</Button>
            <Button onClick={this.prevPage}>Prev. page</Button>
            <Button onClick={this.nextPage}>Next page</Button>
          </div>
        </div>
        <div className="bounds">
          <Document
            file={this.props.notes}
            onLoadSuccess={this.onDocumentLoadSuccess}
            className="document-container">
            <Page pageNumber={this.state.pageNumber} className="current-page" inputRef={(ref) => this.myPage = ref }/>
          </Document>
          <div id="canvas" style={{ width: window.innerWidth * 0.9, height: (window.innerWidth * 0.9) * 1.3 }}>
            { this.state.selections ? this.state.selections[this.state.pageNumber] : ''}
          </div>
        </div>
      </div>
    );
  }
};