import React from "react";
import { HashRouter, Route } from "react-router-dom";
import Home from "./routes/Home";
import Profile from "./routes/Profile";

import "./App.css";

function App() {
  return (
    <HashRouter>
      <Route path="/" exact={true} component={Home} />
      <Route path="/profile/:name" component={Profile} />
    </HashRouter>
  );
}

export default App;
