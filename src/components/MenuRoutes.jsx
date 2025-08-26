import React from 'react';
import {BrowserRouter as Router,Routes,Route} from "react-router-dom";

import Home from '../pages/Home';
import LoginK from '../pages/LoginK';




// import CurrnetCase from '../pages/currentcase';


export default function Menuroutes() {
    return (
      <Router>
        <Routes>
          {/*  */}
          <Route path="/" element={<Home />} />
          <Route path="/Kinza/Login" element={<LoginK />} />


          {/* 
          <Route path="/Mycases" element={<Mycases />} />
         */}
          
        </Routes>
      </Router>
    );
  }
  