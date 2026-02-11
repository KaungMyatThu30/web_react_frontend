import { useEffect, useState } from "react";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import TestApi from "./components/TestApi";
import TestMongo from "./components/TestMongo";
import RequireAuth from "./middleware/RequireAuth";
import Profile from "./components/Profile";
import Login from "./components/Login";
import Logout from "./components/Logout";
function App() {
  return (
    <Routes>
      <Route path="/test_api" element={<TestApi />} />
      <Route path="/test_mongo" element={<TestMongo />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/profile"
        element={
          <RequireAuth>
            <Profile />
          </RequireAuth>
        }
      />
      <Route
        path="/logout"
        element={
          <RequireAuth>
            <Logout />
          </RequireAuth>
        }
      />
    </Routes>
  );
}
export default App;
