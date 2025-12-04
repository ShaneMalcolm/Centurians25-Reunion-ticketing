import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import "flowbite";
import App from './App';
import reportWebVitals from './reportWebVitals';
import { store } from './redux/store';
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <>
      <App />
      <Toaster position="top-right" reverseOrder={false} />
    </>
  </Provider>
);

reportWebVitals();
