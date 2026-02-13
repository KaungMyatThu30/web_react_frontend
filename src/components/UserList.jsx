import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function UserList() {
  const [users, setUsers] = useState([]);

  // State for the Popup Window
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    firstname: "",
    lastname: "",
  });
  const imageInputRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // --- 1. FETCH USERS (Read) ---
  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch(`${API_URL}/api/user`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.error("API did not return a list:", data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!newUser.username || !newUser.email || !newUser.password) {
      alert("Username, email and password are required");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      if (!res.ok) {
        const msg = await res.text();
        alert("Create failed: " + msg);
        return;
      }
      await fetchUsers();
      setNewUser({
        username: "",
        email: "",
        password: "",
        firstname: "",
        lastname: "",
      });
      alert("User created. They can now log in.");
    } catch (err) {
      alert(`Create failed: ${err.message}`);
    }
  }

  // --- 2. DELETE USER ---
  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`${API_URL}/api/user/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("delete failed");
      // Update UI immediately
      setUsers(users.filter((u) => u._id !== id));
    } catch (error) {
      alert("Failed to delete user");
    }
  }

  // --- 3. MODAL FUNCTIONS (Open & Type) ---
  function openEditModal(user) {
    setEditingUser(user);
    setIsModalOpen(true);
  }

  function syncUserInState(userId, partialData) {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user._id === userId ? { ...user, ...partialData } : user
      )
    );
    setEditingUser((prev) => (prev ? { ...prev, ...partialData } : prev));
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setEditingUser({ ...editingUser, [name]: value });
  }

  // --- 4. SAVE CHANGES (Update) ---
  async function saveUser() {
    try {
      const res = await fetch(`${API_URL}/api/user/${editingUser._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstname: editingUser.firstname,
          lastname: editingUser.lastname,
          email: editingUser.email,
        }),
      });

      if (res.ok) {
        // Update the list locally
        setUsers(
          users.map((u) => (u._id === editingUser._id ? editingUser : u))
        );
        setIsModalOpen(false);
        alert("User updated successfully!");
      } else {
        const msg = await res.text();
        alert("Failed to update. " + msg);
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  }

  async function uploadUserImage() {
    const file = imageInputRef.current?.files?.[0];
    if (!file) {
      alert("Please choose an image file.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsImageUploading(true);
      const res = await fetch(`${API_URL}/api/user/${editingUser._id}/image`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to upload image.");
        return;
      }

      syncUserInState(editingUser._id, { profileImage: data.imageUrl });
      imageInputRef.current.value = "";
      alert("Profile image updated.");
    } catch (error) {
      alert("Failed to upload image.");
    } finally {
      setIsImageUploading(false);
    }
  }

  async function removeUserImage() {
    try {
      setIsImageUploading(true);
      const res = await fetch(`${API_URL}/api/user/${editingUser._id}/image`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to remove image.");
        return;
      }

      syncUserInState(editingUser._id, { profileImage: null });
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    } catch (error) {
      alert("Failed to remove image.");
    } finally {
      setIsImageUploading(false);
    }
  }

  // --- HTML DISPLAY ---
  return (
    <div className="user-page">
      <div className="user-card">
        <div className="user-header">
          <div>
            <h2 style={{ margin: 0 }}>User Management</h2>
            <p style={{ margin: 0, color: "#9ca3af", fontSize: 13 }}>
              Create, edit or remove accounts
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link to="/profile">
              <button className="btn btn-ghost">Back to Profile</button>
            </Link>
            <button className="btn btn-primary" onClick={fetchUsers}>
              Refresh
            </button>
          </div>
        </div>

        <form className="new-user-form" onSubmit={handleCreate}>
          <div className="field">
            <label>Username</label>
            <input
              value={newUser.username}
              onChange={(e) =>
                setNewUser({ ...newUser, username: e.target.value })
              }
            />
          </div>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
            />
          </div>
          <div className="field">
            <label>First Name</label>
            <input
              value={newUser.firstname}
              onChange={(e) =>
                setNewUser({ ...newUser, firstname: e.target.value })
              }
            />
          </div>
          <div className="field">
            <label>Last Name</label>
            <input
              value={newUser.lastname}
              onChange={(e) =>
                setNewUser({ ...newUser, lastname: e.target.value })
              }
            />
          </div>
          <button
            className="btn btn-primary"
            type="submit"
            style={{ alignSelf: "flex-start" }}
          >
            Add User
          </button>
        </form>

        <table className="user-table">
          <thead>
            <tr>
              <th>Photo</th>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="user-row">
                <td>
                  {user.profileImage ? (
                    <img
                      src={`${API_URL}${user.profileImage}`}
                      alt="User"
                      width={44}
                      height={44}
                      style={{
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "1px solid #1f2937",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        border: "1px solid #1f2937",
                        display: "grid",
                        placeItems: "center",
                        fontSize: 12,
                        color: "#9ca3af",
                      }}
                    >
                      N/A
                    </div>
                  )}
                </td>
                <td>
                  <div style={{ fontWeight: 700 }}>
                    {user.firstname} {user.lastname}
                  </div>
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>
                    @{user.username}
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span className="pill">{user.status || "ACTIVE"}</span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <button
                    className="btn btn-ghost"
                    onClick={() => openEditModal(user)}
                  >
                    Edit
                  </button>
                  &nbsp;
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(user._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    textAlign: "center",
                    color: "#9ca3af",
                    padding: "18px",
                  }}
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- EDIT POPUP WINDOW --- */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="user-header" style={{ marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>Edit User</h3>
              <button
                className="btn btn-ghost"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="form-grid">
              <div className="field" style={{ gridColumn: "1 / -1" }}>
                <label>Profile Image</label>
                <div style={{ marginBottom: 10 }}>
                  {editingUser.profileImage ? (
                    <img
                      src={`${API_URL}${editingUser.profileImage}`}
                      alt="Profile"
                      width={90}
                      height={90}
                      style={{
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "1px solid #1f2937",
                      }}
                    />
                  ) : (
                    <div style={{ color: "#9ca3af" }}>No profile image</div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  ref={imageInputRef}
                />
                <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                  <button
                    className="btn btn-primary"
                    onClick={uploadUserImage}
                    disabled={isImageUploading}
                  >
                    {isImageUploading ? "Uploading..." : "Upload"}
                  </button>
                  <button
                    className="btn btn-ghost"
                    onClick={removeUserImage}
                    disabled={isImageUploading || !editingUser.profileImage}
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="field">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstname"
                  value={editingUser.firstname || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="field">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastname"
                  value={editingUser.lastname || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={editingUser.email || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-primary" onClick={saveUser}>
                Save
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDelete(editingUser._id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
