import React from "react";
import { Link } from "react-router-dom";

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

  render() {
    const { clicked, name } = this.state;
    const { handleChange } = this;
    return (
      <form>
        <input
          placeholder="이름"
          value={this.state.name}
          onChange={this.handleChange}
        />
        <Link to={{ pathname: "/profile", state: name }}>검색</Link>
      </form>
    );
  }
}

export default Home;
