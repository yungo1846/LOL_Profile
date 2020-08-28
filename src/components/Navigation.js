import React from "react";
import { Helmet } from "react-helmet";
import "../index.css";

class Navigation extends React.Component {
  state = {
    name: "",
    home: "http://localhost:3000/#/",
  };

  handleSubmit = () => {
    const { name } = this.state;
    const href = "http://localhost:3000/#/";
    if (name != "") {
      window.location.href = `${href}profile/${name}`;
    }
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
    const { name, home } = this.state;
    const { handleChange, keyPress } = this;
    return (
      <div className="bg-blue-500 flex items-center">
        <Helmet>
          <script
            src="https://kit.fontawesome.com/843c5da1dc.js"
            crossorigin="anonymous"
          ></script>
        </Helmet>
        <div className="mx-5 mt-3">
          <a href={home}>
            <img className="w-12 h-12 mb-3" src="/images/logo/lol_icon.png" />
          </a>
        </div>
        <div className="flex flex-row">
          <form>
            <input
              className="w-64 h-10 text-center rounded-lg border border-blue-400 mr-3"
              placeholder="이름"
              value={name}
              placeholder="소환사 이름으로 검색"
              onChange={handleChange}
              onKeyPress={keyPress}
            />
          </form>
          <button
            className="bg-indigo-600 w-12 text-white rounded-full"
            onClick={this.handleSubmit}
          >
            <i className="fas fa-search"></i>
          </button>
        </div>
      </div>
    );
  }
}

export default Navigation;
