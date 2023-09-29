import logo from './logo.svg';
import './App.css';
import MyForm from './forms/RepsForm';
import ViolationPage from './forms/ViolationPage';
import FailureToComplete from './forms/FailureToComplete';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './secuirty/Login';
import Register from './secuirty/Register';


function App() {
  return (
    <Router>
      <Routes>
      <Route path="/login" element={<Login/>} />
      <Route path="/register" element={<Register/>}/>
      <Route path="/infractionAssignments/:param1" element={<ViolationPage />} />
      <Route path="/" element={<MyForm />} />
      <Route path="/forms/start-punishment" element={<MyForm />} />
      <Route path="/forms/ftc-closure" element={<FailureToComplete />} />
      </Routes>
    </Router>
  );


}

export default App;
