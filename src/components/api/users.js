import axios from "axios";

export async function getUser(address) {
  const res = await axios.get(
    `http://localhost:4000/profile/${address}`
  );
  return res.data;
}
