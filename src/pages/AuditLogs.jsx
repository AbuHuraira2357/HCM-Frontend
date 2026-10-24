import { useEffect, useState } from "react";
import api from "../services/api";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    api.get("/audit-logs").then((r) => setLogs(r.data.logs));
  }, []);
  return (
    <>
      <h1>Audit Logs</h1>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Time</th><th>User</th><th>Action</th><th>Details</th></tr></thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l._id}>
                <td>{new Date(l.createdAt).toLocaleString()}</td>
                <td>{l.actor?.name}</td><td>{l.action}</td><td>{l.details}</td>
              </tr>
            ))}
            {!logs.length && <tr><td colSpan="4" className="center">No Log</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}