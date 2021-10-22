import React from "react"
import { SVG } from "@svgdotjs/svg.js"
import parse from "html-react-parser";
import {
  debug,
  gridSize,
  gridDivisions,
  gridPadding,
  colors,
} from "./config"
import {
  eyeList,
  partList,
  mouthList,
  noseList,
} from "./parts"
import { grid } from "./utilities";

export class Face extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fill: "#ff00ff",
      draw: SVG().size((gridDivisions + gridPadding * 2) * gridSize, (gridDivisions + gridPadding * 2) * gridSize)
    }
    this.setState({ face: this.state.draw.nested() })
    console.log(this.state.face)
  }

  changeFill = (e) => {
    this.setState({
      fill: "#ff0000"
    })
    this.state.face.size(gridSize * gridDivisions, gridSize * gridDivisions)
      .move(grid(gridPadding), grid(gridPadding))
      .fill(colors[1])
  }

    // this.state.face.size(gridSize * gridDivisions, gridSize * gridDivisions)
    //   .move(grid(gridPadding), grid(gridPadding))
    //   .fill(colors[1])
  render() {
    console.count("faceRender")


    // this.state.face.size(gridSize * gridDivisions, gridSize * gridDivisions)
    //   .move(grid(gridPadding), grid(gridPadding))
    //   .fill(colors[1])

    // draw.rect(draw.width(), draw.height()).attr({ fill: this.state.fill })

    return (
      <div className="face" id="face" onClick={this.changeFill}>{parse(this.state.draw.svg())}</div>
    )
  }
}