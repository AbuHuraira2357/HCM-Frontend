import { useEffect, useState } from "react";
import api, { errMsg } from "../services/api";
import { useAuth } from "../context/AuthContext";

const empty = { name: "", email: "", password: "", role: "employee", department: "", designation: "", basicSalary: "" };

export default function Employees() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(empty);
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });

  const load = () =>
    api.get("/users", { params: { search } }).then((r) => setUsers(r.data.users));

  useEffect(() => { load(); }, [search]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/users", { ...form, basicSalary: Number(form.basicSalary) || 0 });
      setForm(empty);
      setMsg({ type: "ok", text: "User ban gaya" });
      load();
    } catch (err) {
      setMsg({ type: "alert", text: errMsg(err) });
    }
  };

  const toggle = async (id) => {
    await api.patch(`/users/${id}/toggle`);
    load();
  };

  return (
    <>
      <h1>Employees</h1>
      <form className="card form-grid" onSubmit={submit}>
        <input placeholder="Name" required value={form.name} onChange={set("name")} />
        <input type="email" placeholder="Email" required value={form.email} onChange={set("email")} />
        <input type="password" placeholder="Password" required value={form.password} onChange={set("password")} />
        {user.role === "admin" && (
          <select value={form.role} onChange={set("role")}>
            <option value="employee">Employee</option>
            <option value="hr">HR</option>
          </select>
        )}
        <input placeholder="Department" value={form.department} onChange={set("department")} />
        <input placeholder="Designation" value={form.designation} onChange={set("designation")} />
        <input type="number" placeholder="Basic Salary" value={form.basicSalary} onChange={set("basicSalary")} />
        <button className="btn">Add User</button>
        {msg.text && <div className={msg.type === "ok" ? "ok" : "alert"}>{msg.text}</div>}
      </form>

      <input className="search" placeholder="Name se search karo..." value={search}
        onChange={(e) => setSearch(e.target.value)} />

      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Salary</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.department || "-"}</td>
                <td>{u.basicSalary}</td>
                <td><span className={`badge ${u.isActive ? "approved" : "rejected"}`}>{u.isActive ? "Active" : "Disabled"}</span></td>
                <td>
                  {u.role !== "admin" && (
                    <button className="btn small secondary" onClick={() => toggle(u._id)}>
                      {u.isActive ? "Disable" : "Enable"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {!users.length && <tr><td colSpan="7" className="center">No Record</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}