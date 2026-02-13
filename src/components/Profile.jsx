import { useUser } from "../contexts/UserProvider";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function Profile() {
  const { logout, updateUserEmail } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [data, setData] = useState({
    _id: "",
    firstname: "",
    lastname: "",
    email: "",
    profileImage: null,
  });
  const fileInputRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  async function onUpdateImage() {
    const file = fileInputRef.current?.files[0];
    if (!file) {
      alert("Please select a file.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsUploading(true);
      const response = await fetch(`${API_URL}/api/user/profile/image`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (response.ok) {
        alert("Image updated successfully.");
        await fetchProfile();
        fileInputRef.current.value = "";
      } else {
        const message = await readErrorMessage(response);
        alert(message || "Failed to update image.");
      }
    } catch (err) {
      alert("Error uploading image.");
    } finally {
      setIsUploading(false);
    }
  }

  async function onDeleteImage() {
    try {
      setIsUploading(true);
      const response = await fetch(`${API_URL}/api/user/profile/image`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        await fetchProfile();
      } else {
        const message = await readErrorMessage(response);
        alert(message || "Failed to delete image.");
      }
    } catch {
      alert("Error deleting image.");
    } finally {
      setIsUploading(false);
    }
  }

  async function onSaveProfile() {
    if (!data.firstname?.trim() || !data.lastname?.trim() || !data.email?.trim()) {
      alert("First name, last name and email are required.");
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch(`${API_URL}/api/user/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firstname: data.firstname,
          lastname: data.lastname,
          email: data.email,
        }),
      });

      if (response.status === 401) {
        logout();
        return;
      }

      const json = await response.json();
      if (!response.ok) {
        alert(json.message || "Failed to update profile.");
        return;
      }

      updateUserEmail(json?.data?.email || data.email);
      alert("Profile updated successfully.");
      await fetchProfile();
    } catch {
      alert("Error updating profile.");
    } finally {
      setIsSaving(false);
    }
  }

  async function readErrorMessage(response) {
    try {
      const body = await response.json();
      return body?.message;
    } catch {
      return null;
    }
  }

  async function fetchProfile() {
    const result = await fetch(`${API_URL}/api/user/profile`, {
      credentials: "include",
    });
    if (result.status === 401) {
      logout();
      return;
    }

    const profile = await result.json();
    setData({
      _id: profile?._id || "",
      firstname: profile?.firstname || "",
      lastname: profile?.lastname || "",
      email: profile?.email || "",
      profileImage: profile?.profileImage || null,
    });
    setIsLoading(false);
  }

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h3>User Profile Management</h3>
      <div style={{ marginBottom: "12px", display: "flex", gap: "12px" }}>
        <Link to="/users">
          <button>Go to User Management</button>
        </Link>
        <button onClick={logout}>Logout</button>
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <div>
            <label>ID:</label>
            <div>{data._id}</div>
          </div>

          <div style={{ marginTop: "12px" }}>
            <label>First Name:</label>
            <br />
            <input
              type="text"
              value={data.firstname}
              onChange={(e) =>
                setData((prev) => ({ ...prev, firstname: e.target.value }))
              }
            />
          </div>

          <div style={{ marginTop: "12px" }}>
            <label>Last Name:</label>
            <br />
            <input
              type="text"
              value={data.lastname}
              onChange={(e) =>
                setData((prev) => ({ ...prev, lastname: e.target.value }))
              }
            />
          </div>

          <div style={{ marginTop: "12px" }}>
            <label>Email:</label>
            <br />
            <input
              type="email"
              value={data.email}
              onChange={(e) =>
                setData((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </div>

          <div style={{ marginTop: "12px" }}>
            <button onClick={onSaveProfile} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Profile"}
            </button>
          </div>

          <div style={{ marginTop: "18px" }}>
            <label>Profile Image:</label>
            <div style={{ marginTop: "8px" }}>
              {data.profileImage ? (
                <img
                  src={`${API_URL}${data.profileImage}`}
                  width={150}
                  height={150}
                  alt="Profile"
                />
              ) : (
                <div>No profile image</div>
              )}
            </div>
            <div style={{ marginTop: "10px" }}>
              <input
                type="file"
                id="profileImage"
                name="profileImage"
                accept="image/jpeg,image/png,image/gif,image/webp"
                ref={fileInputRef}
              />
            </div>
            <div style={{ marginTop: "10px" }}>
              <button onClick={onUpdateImage} disabled={isUploading}>
                {isUploading ? "Uploading..." : "Upload Image"}
              </button>
              <button
                onClick={onDeleteImage}
                disabled={isUploading || !data.profileImage}
                style={{ marginLeft: "10px" }}
              >
                Remove Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
