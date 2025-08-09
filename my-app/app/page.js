"use client"

import React, { useState } from "react";

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const addUser = async () => {
    const randomId = Math.floor(Math.random() * 1000);
    const newUser = {
      name: `User ${randomId}`,
      email: `user${randomId}@example.com`,
    };

    try {
      await fetch("http://localhost:5000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      alert("User added! Cache cleared.");
    } catch (err) {
      console.error("Error adding user:", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Redis Cache Test</h1>

      <button onClick={fetchUsers} disabled={loading}>
        {loading ? "Loading..." : "Get Users"}
      </button>

      <button
        onClick={addUser}
        style={{ marginLeft: "10px", background: "lightgreen" }}
      >
        Add User
      </button>

      <ul>
        {users.map((u) => (
          <li key={u.id}>
            {u.name} — {u.email}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
