import { useEffect, useRef, useState } from "react";
export default function Items() {
  const [items, setItems] = useState([]);
  const itemNameRef = useRef();
  const itemCategoryRef = useRef();
  const itemPriceRef = useRef();
  async function loadItems() {
    try {
      const response = await fetch("http://localhost:3000/api/item");
      const data = await response.json();
      console.log("==> data : ", data);
      setItems(data);
    } catch (err) {
      console.log("==> err : ", err);
      alert("Loading items failed");
    }
  }
  async function onItemSave() {
    const uri = "http://localhost:3000/api/item";
    const body = {
      name: itemNameRef.current.value,
      category: itemCategoryRef.current.value,
      price: itemPriceRef.current.value,
    };
    const result = await fetch(uri, {
      method: "POST",
      body: JSON.stringify(body),
    });
    const data = await result.json();
    console.log("==> data: ", data);
    loadItems();
  }
  useEffect(() => {
    console.log("==> Init...");
    loadItems();
  }, []);
  return (
    <>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            return (
              <tr key={index}>
                <td>{item._id}</td>
                <td>{item.itemName}</td>
                <td>{item.itemCategory}</td>
                <td>{item.itemPrice}</td>
                <td>
                  <a href={`/items/${item._id}`}>Edit</a>
                </td>
              </tr>
            );
          })}
          <tr>
            <td> - </td>
            <td>
              <input type="text" ref={itemNameRef} />
            </td>
            <td>
              <select ref={itemCategoryRef}>
                <option>Stationary</option>
                <option>Kitchenware</option>
                <option>Appliance</option>
              </select>
            </td>
            <td>
              <input type="text" ref={itemPriceRef} />
            </td>
            <td>
              <button onClick={onItemSave}>Add Item</button>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
