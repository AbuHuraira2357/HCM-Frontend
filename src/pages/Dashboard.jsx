import { useCallback, useEffect, useState } from "react";
import api, { errMsg } from "../services/api";
import { useAuth } from "../context/AuthContext";

const todayStr = () => new Date().toISOString().slice(0, 10);
const fmt = (d) => (d ? new Date(d).toLocaleTimeString() : "-");

function StaffDashboard() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    api.get("/dashboard/stats").then((r) => setStats(r.data.stats));
  }, []);
  if (!stats) return <p>Loading...</p>;
  const cards = [
    ["Total Employees", stats.employees],
    ["Present Today", stats.presentToday],
    ["Late Today", stats.lateToday],
    ["On Leave Today", stats.onLeaveToday],
    ["Pending Leaves", stats.pendingLeaves],
  ];
  return (
    <div className="grid">
      {cards.map(([label, value]) => (
        <div className="card stat" key={label}>
          <span className="muted">{label}</span>
          <h1>{value}</h1>
        </div>
      ))}
    </div>
  );
}

function EmployeeDashboard() {
  const [record, setRecord] = useState(null);
  const [balance, setBalance] = useState(0);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const month = todayStr().slice(0, 7);
    const [a, l] = await Promise.all([
      api.get(`/attendance/me?month=${month}`),
      api.get("/leaves/me"),
    ]);
    setRecord(a.data.records.find((r) => r.date === todayStr()) || null);
    setBalance(l.data.balance);
  }, []);

  useEffect(() => { load(); }, [load]);

  const act = async (path) => {
    setMsg("");
    try {
      await api.post(`/attendance/${path}`);
      await load();
    } catch (e) {
      setMsg(errMsg(e));
    }
  };

  return (
    <div className="grid">
      <div className="card">
        <h3>Aaj ki Attendance</h3>
        <p>Status: <span className={`badge ${record?.status || ""}`}>{record?.status || "not checked in"}</span></p>
        <p>Check-in: {fmt(record?.checkIn)}</p>
        <p>Check-out: {fmt(record?.checkOut)}</p>
        {msg && <div className="alert">{msg}</div>}
        <div className="row">
          <button className="btn" disabled={!!record} onClick={() => act("check-in")}>Check In</button>
          <button className="btn secondary" disabled={!record || !!record?.checkOut} onClick={() => act("check-out")}>Check Out</button>
        </div>
      </div>
      <div className="card stat">
        <span className="muted">Leave Balance</span>
        <h1>{balance}</h1>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  return (
    <>
      <h1>Welcome, {user.name}</h1>
      {user.role === "employee" ? <EmployeeDashboard /> : <StaffDashboard />}
    </>
  );
}