import { useEffect, useState, useRef } from "react";

export default function ItemCRUD() {
  // State for storing items and pagination
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(null); // Tracks which item is being edited

  // Refs for "Add New Item" inputs
  const nameRef = useRef();
  const categoryRef = useRef();
  const priceRef = useRef();

  // Refs for "Edit Item" inputs
  const editNameRef = useRef();
  const editCategoryRef = useRef();
  const editPriceRef = useRef();
  const editStatusRef = useRef();

  const API_URL = "http://localhost:3000/api/item";

  // --- 1. GET ITEMS (Read) ---
  async function loadItems(currentPage) {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?page=${currentPage}&limit=5`);
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

      const json = await res.json();

      // Handle response structure { data: [], pagination: {} }
      setItems(json.data || []);
      setTotalPages(json.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Load Error:", err);
      // Optional: alert("Error loading items");
    } finally {
      setLoading(false);
    }
  }

  // Load items whenever "page" changes
  useEffect(() => {
    loadItems(page);
  }, [page]);

  // --- 2. ADD ITEM (Create) ---
  async function handleAdd() {
    const body = {
      name: nameRef.current.value,
      category: categoryRef.current.value,
      price: priceRef.current.value,
    };

    if (!body.name || !body.price) return alert("Name and Price required");

    try {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      // Clear inputs and reload list
      nameRef.current.value = "";
      priceRef.current.value = "";
      loadItems(page);
    } catch (err) {
      alert("Failed to add item");
    }
  }

  // --- 3. DELETE ITEM (Delete) ---
  async function handleDelete(id) {
    if (!confirm("Delete this item?")) return;

    await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    loadItems(page);
  }

  // --- 4. UPDATE ITEM (Update) ---
  async function handleUpdate(id) {
    const body = {
      name: editNameRef.current.value,
      category: editCategoryRef.current.value,
      price: editPriceRef.current.value,
      status: editStatusRef.current.value,
    };

    await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setEditMode(null); // Exit edit mode
    loadItems(page);
  }

  // Styles to force full screen and white background
  const fullScreenStyle = {
    minHeight: "100vh",
    width: "100vw",
    margin: "0",
    padding: "20px",
    boxSizing: "border-box",
    backgroundColor: "white",
    color: "black",
    fontFamily: "Arial, sans-serif",
    position: "absolute", // Helps override some default CSS
    top: 0,
    left: 0,
  };

  return (
    <div style={fullScreenStyle}>
      <h1>Item Management (CRUD)</h1>

      {/* --- ADD NEW ITEM FORM --- */}
      <div
        style={{
          border: "1px solid #ddd",
          padding: "15px",
          marginBottom: "20px",
          borderRadius: "8px",
          maxWidth: "800px",
        }}
      >
        <h3>Add New Item</h3>
        <input
          ref={nameRef}
          placeholder="Item Name"
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <select
          ref={categoryRef}
          style={{ marginRight: "10px", padding: "5px" }}
        >
          <option value="Stationary">Stationary</option>
          <option value="Kitchenware">Kitchenware</option>
          <option value="Appliance">Appliance</option>
          <option value="Other">Other</option>
        </select>
        <input
          ref={priceRef}
          type="number"
          placeholder="Price"
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <button
          onClick={handleAdd}
          style={{
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            padding: "6px 12px",
            cursor: "pointer",
            borderRadius: "4px",
          }}
        >
          Add
        </button>
      </div>

      {/* --- ITEM LIST TABLE --- */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table
          border="1"
          cellPadding="10"
          style={{
            width: "100%",
            maxWidth: "800px",
            borderCollapse: "collapse",
            borderColor: "#ddd",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No Items Found
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item._id}>
                  {editMode === item._id ? (
                    // --- EDIT MODE ROW ---
                    <>
                      <td>
                        <input
                          defaultValue={item.itemName}
                          ref={editNameRef}
                          style={{ width: "100%" }}
                        />
                      </td>
                      <td>
                        <select
                          defaultValue={item.itemCategory}
                          ref={editCategoryRef}
                        >
                          <option>Stationary</option>
                          <option>Kitchenware</option>
                          <option>Appliance</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          defaultValue={item.itemPrice}
                          ref={editPriceRef}
                          style={{ width: "60px" }}
                        />
                      </td>
                      <td>
                        <select defaultValue={item.status} ref={editStatusRef}>
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="SUSPENDED">SUSPENDED</option>
                          <option value="DELETED">DELETED</option>
                        </select>
                      </td>
                      <td>
                        <button
                          onClick={() => handleUpdate(item._id)}
                          style={{
                            marginRight: "5px",
                            backgroundColor: "#2196F3",
                            color: "white",
                            border: "none",
                            padding: "5px",
                            borderRadius: "3px",
                            cursor: "pointer",
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditMode(null)}
                          style={{
                            backgroundColor: "#9e9e9e",
                            color: "white",
                            border: "none",
                            padding: "5px",
                            borderRadius: "3px",
                            cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    // --- VIEW MODE ROW ---
                    <>
                      <td>{item.itemName}</td>
                      <td>{item.itemCategory}</td>
                      <td>${item.itemPrice}</td>
                      <td>{item.status}</td>
                      <td>
                        <button
                          onClick={() => setEditMode(item._id)}
                          style={{
                            marginRight: "5px",
                            padding: "5px 10px",
                            cursor: "pointer",
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          style={{
                            backgroundColor: "#f44336",
                            color: "white",
                            border: "none",
                            padding: "5px 10px",
                            borderRadius: "3px",
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* --- PAGINATION CONTROLS --- */}
      <div
        style={{
          marginTop: "20px",
          display: "flex",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          style={{ padding: "5px 10px" }}
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          style={{ padding: "5px 10px" }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
