import { useUser } from "../contexts/UserProvider";
import { useEffect, useState } from "react";
export default function Profile() {
  const { user, logout } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({});
  const API_URL = import.meta.env.VITE_API_URL;
  async function fetchProfile() {
    const result = await fetch(`${API_URL}/api/user/profile`, {
      credentials: "include",
    });
    if (result.status == 401) {
      logout();
    } else {
      const data = await result.json();
      console.log("data: ", data);
      setIsLoading(false);
      setData(data);
    }
  }
  useEffect(() => {
    fetchProfile();
  }, []);
  return (
    <div>
      <h3>Profile...</h3>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          ID: {data._id} <br />
          Email: {data.email} <br />
          First Name: {data.firstname} <br />
          Last Name: {data.lastname} <br />
        </div>
      )}
    </div>
  );
}
