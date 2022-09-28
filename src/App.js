import "./App.css";
import { Route, Routes } from "react-router-dom";
import Home from "./pages";
import UserPage from "./pages/userPage";
import { Fragment } from "react";

function App() {
  return (
    <Routes>
      <Fragment>
        <Route path={"/"} element={<UserPage />} />
        <Route path={"/call"} element={<Home />} />
      </Fragment>
    </Routes>
  );
}

export default App;
