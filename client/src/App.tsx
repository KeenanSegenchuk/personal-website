import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LangtonPage from "./pages/LangtonPage";
import Home from "./pages/Home";

const App: React.FC = () => {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/langton" element={<LangtonPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;