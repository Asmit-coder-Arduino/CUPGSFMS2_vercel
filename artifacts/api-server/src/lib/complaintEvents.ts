import { EventEmitter } from "events";
import type { Response } from "express";

interface SSEClient {
  id: string;
  res: Response;
  departmentId?: number;
  role: "hod" | "admin";
}

class ComplaintEventEmitter extends EventEmitter {
  private clients: SSEClient[] = [];

  addClient(client: SSEClient) {
    this.clients.push(client);
    client.res.on("close", () => {
      this.clients = this.clients.filter(c => c.id !== client.id);
    });
  }

  notifyNewComplaint(complaint: {
    id: number;
    referenceId: string;
    subject: string;
    category: string;
    priority: string;
    departmentId: number;
    departmentName?: string;
    studentName: string;
    isAnonymous: boolean;
    createdAt: string | Date;
  }) {
    const data = JSON.stringify({
      type: "new_complaint",
      complaint: {
        id: complaint.id,
        referenceId: complaint.referenceId,
        subject: complaint.subject,
        category: complaint.category,
        priority: complaint.priority,
        departmentId: complaint.departmentId,
        departmentName: complaint.departmentName || "",
        studentName: complaint.isAnonymous ? "Anonymous" : complaint.studentName,
        createdAt: complaint.createdAt,
      },
    });

    for (const client of this.clients) {
      try {
        if (client.role === "admin") {
          client.res.write(`data: ${data}\n\n`);
        } else if (client.role === "hod" && client.departmentId === complaint.departmentId) {
          client.res.write(`data: ${data}\n\n`);
        }
      } catch {}
    }
  }

  notifyStatusUpdate(complaint: {
    id: number;
    referenceId: string;
    status: string;
    departmentId: number;
  }) {
    const data = JSON.stringify({
      type: "status_update",
      complaint,
    });

    for (const client of this.clients) {
      try {
        if (client.role === "admin" || (client.role === "hod" && client.departmentId === complaint.departmentId)) {
          client.res.write(`data: ${data}\n\n`);
        }
      } catch {}
    }
  }

  getClientCount() {
    return this.clients.length;
  }
}

export const complaintEvents = new ComplaintEventEmitter();
