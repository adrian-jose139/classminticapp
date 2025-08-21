// import logo from './logo.svg';
// import './App.css';

import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/loginpage/LoginPage';
import ForgotPage from './pages/loginpage/ForgotPage/ForgotPage';
import RegisterPage from './pages/loginpage/RegisterPage/RegisterPage';
// import StateContador from './playground/userState/userState';

/*import pages de hooks */
import HooksGral from './playground/HooksGral';
import UseStateHook from './playground/useState';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/forgot" element={<ForgotPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* rutas para hooks */}

        <Route path="/hooks" element={<HooksGral />} />
        <Route path="/useState" element={<UseStateHook />} />


      </Routes>

    </BrowserRouter>

  );
}

export default App;
