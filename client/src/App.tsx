import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LangtonPage from "./Langton/components/LangtonPage";
import fridgEpagE from "./fridgE/fridgEpagE";
import AppContext from "./AppContext";
import Home from "./pages/Home";

const App: React.FC = () => {
  return (
    <div className="App">
      <AppContext>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/langton" element={<LangtonPage />} />
	    <Route path="/fridgE" element={<fridgEpagE />} />
          </Routes>
        </BrowserRouter>
      </AppContext>
    </div>
  );
};

export default App;