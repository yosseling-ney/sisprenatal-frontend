import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { App as AntdApp } from "antd";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthProvider";
import { queryClient } from "./lib/queryClient";
import "antd/dist/reset.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AntdApp>
          <AuthProvider>
            <App />
          </AuthProvider>
        </AntdApp>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
