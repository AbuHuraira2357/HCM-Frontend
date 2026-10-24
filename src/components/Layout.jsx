import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const isStaff = ["admin", "hr"].includes(user.role);

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>HCM Lite</h2>
        <nav>
          <NavLink to="/" end>Dashboard</NavLink>
          {isStaff && <NavLink to="/employees">Employees</NavLink>}
          <NavLink to="/attendance">Attendance</NavLink>
          <NavLink to="/leaves">Leaves</NavLink>
          <NavLink to="/payroll">{isStaff ? "Payroll" : "Payslips"}</NavLink>
          {user.role === "admin" && <NavLink to="/audit">Audit Logs</NavLink>}
        </nav>
        <div className="user-box">
          <b>{user.name}</b>
          <small>{user.role.toUpperCase()}</small>
          <button className="btn danger" onClick={() => { logout(); nav("/login"); }}>
            Logout
          </button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}