import React from "react";
import logo from "../../assets/img/logo.svg"
import "./header.scss"

export class Header extends React.Component {
  render() {
    return (
      <header className="header">
        <img src={logo} alt="Humaan"/>
        Hello, {this.props.name}
      </header>
    );
  }
}