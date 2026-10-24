import { useEffect, useState } from "react";
import api, { errMsg } from "../services/api";
import { useAuth } from "../context/AuthContext";

const d = (x) => new Date(x).toISOString().slice(0, 10);

export default function Leaves() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState(0);
  const [form, setForm] = useState({ type: "casual", from: "", to: "", reason: "" });
  const [msg, setMsg] = useState({ type: "", text: "" });

  const isEmployee = user.role === "employee";
  const canReview = user.role === "hr";

  const load = async () => {
    const r = await api.get(isEmployee ? "/leaves/me" : "/leaves");
    setLeaves(r.data.leaves);
    if (isEmployee) setBalance(r.data.balance);
  };

  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const apply = async (e) => {
    e.preventDefault();
    try {
      await api.post("/leaves", form);
      setForm({ type: "casual", from: "", to: "", reason: "" });
      setMsg({ type: "ok", text: "Apply for leave" });
      load();
    } catch (err) {
      setMsg({ type: "alert", text: errMsg(err) });
    }
  };

  const review = async (id, status) => {
    try {
      await api.patch(`/leaves/${id}/review`, { status });
      load();
    } catch (err) {
      setMsg({ type: "alert", text: errMsg(err) });
    }
  };

  return (
    <>
      <h1>Leaves</h1>
      {isEmployee && (
        <form className="card form-grid" onSubmit={apply}>
          <p><b>Balance: {balance} din</b></p>
          <select value={form.type} onChange={set("type")}>
            <option value="casual">Casual</option>
            <option value="sick">Sick</option>
            <option value="annual">Annual</option>
          </select>
          <input type="date" required value={form.from} onChange={set("from")} />
          <input type="date" required value={form.to} onChange={set("to")} />
          <input placeholder="Reason" value={form.reason} onChange={set("reason")} />
          <button className="btn">Apply Leave</button>
        </form>
      )}
      {msg.text && <div className={msg.type === "ok" ? "ok" : "alert"}>{msg.text}</div>}

      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              {!isEmployee && <th>Employee</th>}
              <th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th>
              {canReview && <th></th>}
            </tr>
          </thead>
          <tbody>
            {leaves.map((l) => (
              <tr key={l._id}>
                {!isEmployee && <td>{l.user?.name}</td>}
                <td>{l.type}</td>
                <td>{d(l.from)}</td>
                <td>{d(l.to)}</td>
                <td>{l.days}</td>
                <td>{l.reason || "-"}</td>
                <td><span className={`badge ${l.status}`}>{l.status}</span></td>
                {canReview && (
                  <td className="row">
                    {l.status === "pending" && (
                      <>
                        <button className="btn small" onClick={() => review(l._id, "approved")}>Approve</button>
                        <button className="btn small danger" onClick={() => review(l._id, "rejected")}>Reject</button>
                      </>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {!leaves.length && <tr><td colSpan="8" className="center">No Record Available</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}