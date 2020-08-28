import React from "react";
import { Link } from "react-router-dom";
import Profile from "./Profile";
import "../index.css";
import { render } from "@testing-library/react";

class Home extends React.Component {
  state = {
    name: "",
  };

  handleSubmit = () => {
    const { name } = this.state;
    const { href } = window.location;
    window.location.href = `${href}profile/${name}`;
  };

  handleChange = (e) => {
    this.setState({
      name: e.target.value,
    });
  };

  keyPress = (e) => {
    if (e.key === "Enter") {
      this.handleSubmit();
    }
  };

  render() {
    const { name } = this.state;
    const { handleChange, keyPress } = this;
    return (
      <div className="w-screen h-screen flex justify-center items-center bg-gray-200">
        <div className="flex flex-row">
          <form>
            <input
              placeholder="이름"
              value={name}
              placeholder="소환사 이름으로 검색"
              onChange={handleChange}
              onKeyPress={keyPress}
            />
          </form>
          <button onClick={this.handleSubmit}>클릭</button>
        </div>
      </div>
    );
  }
}

export default Home;
