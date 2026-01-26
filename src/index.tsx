import ReactDOM, { Container } from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import App from './components/App';
import React from 'react';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as Container
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);