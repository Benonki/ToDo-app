import { BrowserRouter, Routes, Route, Navigate  } from "react-router";
import Layout from './layout.jsx';
import Login from './screens/Login';
import Register from './screens/Register';
import Home from './screens/Home';
import Profile from './screens/Profile';
import './App.css'
import Cookies from "js-cookie";

const PrivateRoute = ({ children }) => {
    const accessToken = Cookies.get('authToken');
    return accessToken ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
              element={
                  /*<PrivateRoute>*}
                  <Layout />            Na potem jak będzię token
                </PrivateRoute>*/
                  <Layout />
              }
          >
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
  )
}

export default App
