import React from "react";
import { Link } from "react-router-dom";
import Profile from "./Profile";
import "../index.css";

class Home extends React.Component {
  state = {
    clicked: false,
    name: "",
  };
  handleChange = (e) => {
    this.setState({
      name: e.target.value,
    });
  };

  keyPress = (e) => {
    if (e.key === "Enter") {
      console.log("enter");
    }
  };

  render() {
    const { clicked, name } = this.state;
    const { handleChange, keyPress } = this;
    return (
      <form>
        <input
          placeholder="이름"
          value={this.state.name}
          onChange={handleChange}
          onKeyPress={keyPress}
        />
        <Link to={{ pathname: "/profile", state: "곤이씨" }}>검색</Link>
      </form>
    );
  }
}

export default Home;
