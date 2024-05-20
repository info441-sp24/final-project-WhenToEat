import axios from 'axios';
const Home = () => {
    return (
      <div>
        <h1>When2Eat</h1>
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