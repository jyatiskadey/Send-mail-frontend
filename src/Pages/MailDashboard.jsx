import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Select from "react-select";
import Swal from "sweetalert2"; // ✅ Import SweetAlert2
import { Mail, Send, Trash, Inbox, Menu, Pencil, LogOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// ✅ API Base URL
const API_BASE_URL = "http://localhost:5000/api";

function MailDashboard() {
  const [selectedMail, setSelectedMail] = useState(null);
  const [currentFolder, setCurrentFolder] = useState("inbox");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);
  const [newMail, setNewMail] = useState({ recipient: "", subject: "", content: "" });
  const [recipientOptions, setRecipientOptions] = useState([]);
  const [mails, setMails] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch Token & Sender ID from Local Storage
  const token = localStorage.getItem("token");
  const senderId = localStorage.getItem("userid"); // ✅ Get sender ID

  // ✅ Fetch Recipients List
  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/auth/getAllUserName`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (Array.isArray(data)) {
          setRecipientOptions(
            data.map(user => ({ value: user._id, label: user.name }))
          );
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, [token]);

  // ✅ Fetch Mails
  useEffect(() => {
    const fetchMails = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/mail`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setMails(data);
      } catch (error) {
        console.error("Error fetching mails:", error);
      }
      setLoading(false);
      setSelectedMail(null);
    };
    fetchMails();
  }, [currentFolder, token]);

  // ✅ Send Email
  const sendMail = async () => {
    if (!newMail.recipient || !newMail.subject || !newMail.content) {
      Swal.fire("Error", "All fields are required!", "error");
      return;
    }
    if (!token || !senderId) {
      Swal.fire("Error", "You must be logged in to send mail.", "error");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/mail/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          senderId,
          recipient: newMail.recipient,
          subject: newMail.subject,
          content: newMail.content,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Swal.fire("Success", "Mail sent successfully!", "success");
        setComposeOpen(false);
        setNewMail({ recipient: "", subject: "", content: "" });
        setCurrentFolder("sent");
      } else {
        Swal.fire("Error", data.message || "Failed to send mail.", "error");
      }
    } catch (error) {
      console.error("Error sending mail:", error);
    }
  };

  // ✅ Logout Function with SweetAlert
  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Logout!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        localStorage.removeItem("userid");
        window.location.href = "/";

      }
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className={`bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-4 shadow-lg transition-all ${sidebarOpen ? "w-64" : "w-16"}`}>
        <Button variant="ghost" className="mb-4" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu />
        </Button>
        <Button variant="default" className="w-full flex gap-2 mb-4" onClick={() => setComposeOpen(true)}>
          <Pencil /> Compose
        </Button>
        <nav className="space-y-2">
          {["inbox", "sent", "trash"].map((folder) => (
            <Button
              key={folder}
              variant="ghost"
              className="w-full flex gap-2 capitalize"
              onClick={() => setCurrentFolder(folder)}
            >
              {folder === "inbox" && <Inbox />}
              {folder === "sent" && <Send />}
              {folder === "trash" && <Trash />}
              {folder}
            </Button>
          ))}
        </nav>
        <Button variant="destructive" className="mt-6 w-full flex gap-2" onClick={handleLogout}>
          <LogOut /> Logout
        </Button>
      </aside>

      {/* Mail List */}
      <main className="flex-1 p-4">
        <h2 className="text-lg font-semibold capitalize">{currentFolder}</h2>
        {loading ? (
          <p>Loading...</p>
        ) : mails.length > 0 ? (
          mails.map((mail) => (
            <Card key={mail._id} className="p-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700">
              <CardContent onClick={() => setSelectedMail(mail)}>
                <p className="font-semibold">{mail.sender?.name || "Unknown Sender"}</p>
                <p className="text-sm text-gray-600">{mail.subject}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-gray-500">No emails in this folder.</p>
        )}
      </main>

      {/* Mail Detail View */}
      {selectedMail && (
        <aside className="w-96 bg-white dark:bg-gray-800 p-4 shadow-lg border-l">
          <h2 className="text-lg font-semibold">{selectedMail.subject}</h2>
          <p className="text-gray-600">From: {selectedMail.sender?.name || "Unknown Sender"}</p>
          <p className="mt-4">{selectedMail.content}</p>
        </aside>
      )}
    </div>
  );
}

export default MailDashboard;
