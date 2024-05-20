import axios from 'axios';
import '../styles/Home.css'
const Home = () => {
    return (
      <div className="home">
        <h1>Welcome to When2Eat!</h1>
        <p>The one stop place to fix the indecisiveness of finding restaurants and eating out.</p>
        <div id="info"><br /></div>
        <button onClick={loadInfo}>YO</button>
      </div>
    )
  }

  
async function loadInfo() {
    try {
      const response = await axios.get("http://localhost:8080/api/friends");
      document.getElementById("info").innerHTML = response.data;
    } catch (error) {
      console.error("Error fetching data:", error);
      document.getElementById("info").innerHTML = "Error loading data";
    }
  }
  
  export default Home