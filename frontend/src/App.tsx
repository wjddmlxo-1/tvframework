import RootRoutes from "@/routes";
import { BrowserRouter as Router } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";

import "@/css/base.css";
import "@/css/layout.css";
import "@/css/component.css";
import "@/css/material-variables.css";
import "@/css/material-base.css";
import "@/css/material-layout.css";
import "@/css/material-components.css";
import "@/css/app-sidebar.css";
import "@/css/page.css";
import "@/css/main-dashboard.css";
import "@/css/login-material.css";
import "@/css/response.css";


import "@/css/sample/sample.css";



function App() {
  return (
    <div className="wrap md-wrap">
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <LanguageProvider>
          <RootRoutes />
        </LanguageProvider>
      </Router>
    </div>
  );
}

export default App;

