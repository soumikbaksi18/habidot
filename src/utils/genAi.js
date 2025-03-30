import axios from "axios";
// import { BackendURLAi } from "../constants/url";
import AsyncStorage from "@react-native-async-storage/async-storage";
const BackendURLAi = "https://ai-api.catoff.xyz";
const getToken = () => {
  return (
    AsyncStorage.getItem("authToken") || AsyncStorage.getItem("accessToken")
  );
};

const generateDescription = async (body) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("Authorization token is missing");
    }
    const response = await axios.post(
      `${BackendURLAi}/generate-description/`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE0OTUsImlhdCI6MTcyMzIxOTEwNSwiZXhwIjoxNzIzMjIyMTA1fQ.NZyfszRtjNKNZ_6iybKxhCNGLIwRH6QpHFzwKob2n14`,
        },
      }
    );

    return response.data.challenge_description;
  } catch (error) {
    console.error("Error generating description:", error);
    throw error;
  }
};

const generateImage = async (body) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("Authorization token is missing");
    }
    const response = await axios.post(`${BackendURLAi}/generate-image/`, body, {
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${token}`,
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE0OTUsImlhdCI6MTcyMzIxOTEwNSwiZXhwIjoxNzIzMjIyMTA1fQ.NZyfszRtjNKNZ_6iybKxhCNGLIwRH6QpHFzwKob2n14`,
      },
    });

    return response.data.image_url;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

export { generateDescription, generateImage };
