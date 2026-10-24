import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const fmt = (d) => (d ? new Date(d).toLocaleTimeString() : "-");

export default function Attendance() {
  const { user } = useAuth();
  const isStaff = ["admin", "hr"].includes(user.role);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const url = isStaff ? "/attendance" : "/attendance/me";
    api.get(url, { params: { month } }).then((r) => setRecords(r.data.records));
  }, [month, isStaff]);

  return (
    <>
      <h1>Attendance</h1>
      <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              {isStaff && <th>Employee</th>}
              <th>Check In</th><th>Check Out</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r._id}>
                <td>{r.date}</td>
                {isStaff && <td>{r.user?.name}</td>}
                <td>{fmt(r.checkIn)}</td>
                <td>{fmt(r.checkOut)}</td>
                <td><span className={`badge ${r.status}`}>{r.status}</span></td>
              </tr>
            ))}
            {!records.length && <tr><td colSpan="5" className="center">No Record</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}