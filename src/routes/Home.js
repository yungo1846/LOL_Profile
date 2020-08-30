import React from "react";
import { Helmet } from "react-helmet";
import "../index.css";

class Home extends React.Component {
  state = {
    name: "",
  };

  handleSubmit = () => {
    const { name } = this.state;
    const href = "http://localhost:3000/#/"; //배포시 href 주소 바꿔야함! Navigation도!
    if (name !== "") {
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
    const { name } = this.state;
    const { handleChange, keyPress } = this;
    return (
      <div className="w-screen h-screen flex flex-col justify-center items-center bg-blue-200">
        <Helmet>
          <script
            src="https://kit.fontawesome.com/843c5da1dc.js"
            crossorigin="anonymous"
          ></script>
        </Helmet>
        <div className="flex flex-col items-center mb-10">
          <img
            className="w-20 h-20 mb-3"
            src="/images/logo/lol_icon.png"
            alt="lol icon"
          />
          <img
            className="h-32 p-2"
            src="/images/logo/logo2.png"
            alt="lol logo"
          />
        </div>
        <div className="flex flex-row mb-20">
          <form>
            <input
              className="w-64 h-12 text-center rounded-lg border border-blue-400 mr-3"
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
            <i class="fas fa-search"></i>
          </button>
        </div>
      </div>
    );
  }
}

export default Home;
