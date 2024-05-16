import logo from './logo.svg';
import './App.css';
import axios from 'axios';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <div id="info"></div>
        <button onClick={loadInfo}>YO</button>
      </header>
    </div>
  );
}

async function loadInfo() {
  try {
    const response = await axios.get("http://localhost:8080/friends");
    document.getElementById("info").innerHTML = response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    document.getElementById("info").innerHTML = "Error loading data";
  }
}

export default App;
