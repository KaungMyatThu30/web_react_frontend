import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ItemDetail() {
  const { id } = useParams();
  const itemNameRef = useRef();
  const itemCategoryRef = useRef();
  const itemPriceRef = useRef();
  const navigate = useNavigate();

  async function loadItem() {
    const uri = `http://localhost:3000/api/item/${id}`;
    const result = await fetch(uri);
    const data = await result.json();
    itemNameRef.current.value = data.itemName;
    itemCategoryRef.current.value = data.itemCategory;
    itemPriceRef.current.value = data.itemPrice;
  }

  async function onUpdate() {
    const body = {
      name: itemNameRef.current.value,
      category: itemCategoryRef.current.value,
      price: itemPriceRef.current.value,
    };
    const uri = `http://localhost:3000/api/item/${id}`;
    const result = await fetch(uri, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (result.ok) {
      navigate("/items");
    }
  }

  useEffect(() => {
    loadItem();
  }, []);

  return (
    <div>
      <table>
        <tbody>
          <tr>
            <th style={{ textAlign: "left" }}>Name</th>
            <td style={{ textAlign: "left", paddingLeft: "20px" }}>
              <input type="text" ref={itemNameRef} />
            </td>
          </tr>
          <tr>
            <th style={{ textAlign: "left" }}>Category</th>
            <td style={{ textAlign: "left", paddingLeft: "20px" }}>
              <select ref={itemCategoryRef}>
                <option>Stationary</option>
                <option>Kitchenware</option>
                <option>Appliance</option>
              </select>
            </td>
          </tr>
          <tr>
            <th style={{ textAlign: "left" }}>Price</th>
            <td style={{ textAlign: "left", paddingLeft: "20px" }}>
              <input type="text" ref={itemPriceRef} />
            </td>
          </tr>
        </tbody>
      </table>
      <hr />
      <button onClick={onUpdate}>Update</button>
    </div>
  );
}
