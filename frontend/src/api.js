import axios from "axios";

const API = axios.create({
  baseURL:   "https://pricewatch-4n3q.onrender.com", // backend URL
});

export default API;
