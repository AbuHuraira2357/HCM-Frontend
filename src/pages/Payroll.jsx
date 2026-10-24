import { useEffect, useState } from "react";
import api, { errMsg } from "../services/api";
import { useAuth } from "../context/AuthContext";

function printPayslip(p, name) {
  const w = window.open("", "_blank");
  w.document.write(`
    <html><head><title>Payslip ${p.month}</title>
    <style>body{font-family:Arial;padding:40px;max-width:500px;margin:auto}
    td{padding:8px;border-bottom:1px solid #ddd}h2{text-align:center}</style></head>
    <body><h2>HCM Lite - Payslip</h2>
    <table width="100%">
    <tr><td>Employee</td><td>${name}</td></tr>
    <tr><td>Month</td><td>${p.month}</td></tr>
    <tr><td>Basic Salary</td><td>${p.basicSalary}</td></tr>
    <tr><td>Present Days</td><td>${p.presentDays}</td></tr>
    <tr><td>Absent Days</td><td>${p.absentDays}</td></tr>
    <tr><td>Deduction</td><td>${p.deduction}</td></tr>
    <tr><td><b>Net Salary</b></td><td><b>${p.netSalary}</b></td></tr>
    </table>
    <script>window.onload=()=>window.print()</script></body></html>`);
  w.document.close();
}

function EmployeePayslips() {
  const { user } = useAuth();
  const [slips, setSlips] = useState([]);
  useEffect(() => {
    api.get("/payroll/me").then((r) => setSlips(r.data.payslips));
  }, []);
  return (
    <>
      <h1>My Payslips</h1>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Month</th><th>Basic</th><th>Deduction</th><th>Net</th><th></th></tr></thead>
          <tbody>
            {slips.map((p) => (
              <tr key={p._id}>
                <td>{p.month}</td><td>{p.basicSalary}</td><td>{p.deduction}</td><td><b>{p.netSalary}</b></td>
                <td><button className="btn small" onClick={() => printPayslip(p, user.name)}>Download</button></td>
              </tr>
            ))}
            {!slips.length && <tr><td colSpan="5" className="center">No payslip </td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

function StaffPayroll() {
  const { user } = useAuth();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const load = () =>
    api.get("/payroll", { params: { month } }).then((r) => setRows(r.data.payroll));

  useEffect(() => { load(); }, [month]);

  const run = async (path, okText) => {
    try {
      await api.post(`/payroll/${path}`, { month });
      setMsg({ type: "ok", text: okText });
      load();
    } catch (e) {
      setMsg({ type: "alert", text: errMsg(e) });
    }
  };

  return (
    <>
      <h1>Payroll</h1>
      <div className="row">
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        {user.role === "hr" && (
          <button className="btn" onClick={() => run("prepare", "Payroll is prepared")}>Prepare Payroll</button>
        )}
        {user.role === "admin" && (
          <button className="btn" onClick={() => run("finalize", "Payroll is finalize ")}>Finalize Payroll</button>
        )}
      </div>
      {msg.text && <div className={msg.type === "ok" ? "ok" : "alert"}>{msg.text}</div>}
      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th>Employee</th><th>Basic</th><th>Present</th><th>Absent</th><th>Deduction</th><th>Net</th><th>Status</th></tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p._id}>
                <td>{p.user?.name}</td><td>{p.basicSalary}</td><td>{p.presentDays}</td>
                <td>{p.absentDays}</td><td>{p.deduction}</td><td><b>{p.netSalary}</b></td>
                <td><span className={`badge ${p.status === "finalized" ? "approved" : "pending"}`}>{p.status}</span></td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan="7" className="center">This month's payroll has not been processed</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function Payroll() {
  const { user } = useAuth();
  return user.role === "employee" ? <EmployeePayslips /> : <StaffPayroll />;
}