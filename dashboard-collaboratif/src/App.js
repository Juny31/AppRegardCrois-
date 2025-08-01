import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import TaskBoard from "./components/TaskBoard";
import ContactBoard from "./components/ContactBoard";
import ProgressDashboard from "./components/ProgressDashboard";

const socket = io("http://localhost:4000");

function App() {
  const [data, setData] = useState({
    tasks: [],
    contacts: [],
    notes: "",
    progress: 0,
  });

  useEffect(() => {
    socket.on("init", (d) => setData(d));
    socket.on("data", (d) => setData(d));
    axios.get("http://localhost:4000/data").then((res) => setData(res.data));
    return () => socket.off();
  }, []);

  const updateTasks = (tasks) => {
    socket.emit("update", { tasks });
  };

  const updateContacts = (contacts) => {
    socket.emit("update", { contacts });
  };

  function exportJSON(data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dashboard-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <h1>Dashboard Collaboratif</h1>
      <button onClick={() => exportJSON(data)}>
        Exporter les données (.json)
      </button>

      <ProgressDashboard tasks={data.tasks} />
      <TaskBoard tasks={data.tasks} onUpdate={updateTasks} />
      <ContactBoard contacts={data.contacts} onUpdate={updateContacts} />
    </div>
  );
}

export default App;
