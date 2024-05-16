import axios from 'axios';
const Home = () => {
    return (
      <div>
        <div id="info"></div>
        <button onClick={loadInfo}>YO</button>
      </div>
    )
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
  
  export default Home