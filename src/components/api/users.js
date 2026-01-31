import axios from "axios";

export async function getUser(address) {
  const res = await axios.get(
    `/profile/${address}`
  );
  return res.data;
}
