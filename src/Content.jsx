import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Content() {
  const navigate = useNavigate();
  const [content, setContent] = useState([]);
  const [requests, setRequests] = useState([]);

  const [requestSearch, setRequestSearch] = useState("");
  const [requestStatus, setRequestStatus] = useState("All");
  const [requestDate, setRequestDate] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    status: "Draft",
  });

  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  // Clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  // Get content from backend
  const fetchContent = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/content", {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();

      setContent(data.reverse());
    } catch (error) {
      console.error("Error fetching content:", error);
    }
  };

  // Get customer requests with search and filters
  const fetchRequests = async () => {
    try {
      const params = new URLSearchParams();
      console.log("Search:", requestSearch);
      console.log("Status:", requestStatus);
      console.log("Date:", requestDate);

      if (requestSearch.trim()) {
        params.append("search", requestSearch.trim());
      }

      if (requestStatus !== "All") {
        params.append("status", requestStatus);
      }

      if (requestDate) {
        params.append("date", requestDate);
      }

      console.log(
        "REQUEST URL:",
        `http://localhost:5000/api/admin/requests?${params.toString()}`
      );

      const response = await fetch(
        `http://localhost:5000/api/admin/requests?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(data.error || "Unable to load requests.");
        return;
      }

      setRequests(data);
    } catch (error) {
      console.error("Error fetching customer requests:", error);
    }
  };

  const handleRequestStatusChange = async (requestId, newStatus) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/requests/${requestId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Unable to update request status.");
        return;
      }

      setMessage(data.message);

      // Refresh requests
      fetchRequests();
    } catch (error) {
      console.error("Error updating request status:", error);
      setMessage("Something went wrong. Please try again.");
    }
  };

  // Load content when page opens
  useEffect(() => {
    fetchContent();
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [requestSearch, requestStatus, requestDate]);

  // Handle form changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Add or update content
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingId
        ? `http://localhost:5000/api/content/${editingId}`
        : "http://localhost:5000/api/content";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error);
        return;
      }

      setMessage(data.message);

      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        status: "Draft",
      });

      setEditingId(null);

      // Refresh content list
      fetchContent();
    } catch (error) {
      console.error("Error saving content:", error);
      setMessage("Something went wrong. Please try again.");
    }
  };

  // Edit content
  const handleEdit = (item) => {
    setEditingId(item.id);

    setFormData({
      title: item.title,
      description: item.description,
      category: item.category,
      status: item.status,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Delete content
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this content?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/content/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error);
        return;
      }

      setMessage(data.message);

      // Refresh content list
      fetchContent();
    } catch (error) {
      console.error("Error deleting content:", error);
      setMessage("Something went wrong. Please try again.");
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingId(null);

    setFormData({
      title: "",
      description: "",
      category: "",
      status: "Draft",
    });
  };

  return (
    <div className="content-page">

      {/* Success / Error Message */}
      {message && (
        <div className="content-message">
          {message}
        </div>
      )}

      {/* Page Header */}
      <div className="content-header">
        <p className="content-eyebrow">INTERNAL CONTENT</p>

        <h1>Content Management</h1>

        <button
            onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/");
            }}
        >
            Log Out
        </button>

        <p className="content-intro">
          Manage Fevora's digital content, services, and published
          information from one place.
        </p>
      </div>

      {/* Add / Edit Form */}
      <div className="content-form-card">

        <div className="content-form-heading">
          <span>
            {editingId ? "EDIT CONTENT" : "ADD NEW CONTENT"}
          </span>

          <h2>
            {editingId
              ? "Update your content"
              : "Create something new"}
          </h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="content-form"
        >

          {/* Title */}
          <div className="content-input-group">
            <label>Title</label>

            <input
              type="text"
              name="title"
              placeholder="Enter content title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          {/* Description */}
          <div className="content-input-group">
            <label>Description</label>

            <textarea
              name="description"
              placeholder="Write a description..."
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          {/* Category + Status */}
          <div className="content-form-row">

            <div className="content-input-group">
              <label>Category</label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select a solution
                </option>

                <option value="Web Development">
                  Web Development
                </option>

                <option value="Brand & Logo Design">
                  Brand & Logo Design
                </option>

                <option value="AI Solutions">
                  AI Solutions
                </option>

                <option value="Cloud Solutions">
                  Cloud Solutions
                </option>

                <option value="UI/UX Design">
                  UI/UX Design
                </option>

                <option value="Custom Software">
                  Custom Software
                </option>
              </select>
            </div>

            <div className="content-input-group">
              <label>Status</label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Draft">
                  Draft
                </option>

                <option value="Published">
                  Published
                </option>
              </select>
            </div>

          </div>

          {/* Form Buttons */}
          <div className="content-form-actions">

            <button
              type="submit"
              className="content-primary-button"
            >
              {editingId
                ? "Update Content"
                : "Add Content"}
            </button>

            {editingId && (
              <button
                type="button"
                className="content-cancel-button"
                onClick={handleCancel}
              >
                Cancel
              </button>
            )}

          </div>

        </form>
      </div>

      {/* Existing Content */}
      <div className="content-list-section">

        <div className="content-list-heading">

          <div>
            <p className="content-eyebrow">
              CONTENT LIBRARY
            </p>

            <h2>Existing Content</h2>
          </div>

          <span className="content-count">
            {content.length}{" "}
            {content.length === 1 ? "item" : "items"}
          </span>

        </div>

        {/* Empty State */}
        {content.length === 0 ? (
          <div className="empty-content">
            <p>No content available yet.</p>
          </div>
        ) : (

          /* Content Table */
          <div className="content-table-wrapper">

            <table className="content-table">

              <thead>
                <tr>
                  <th>#</th>
                  <th>Content</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {content.map((item, index) => (

                  <tr key={item.id}>

                    {/* Sequential Number */}
                    <td className="content-number">
                      {index + 1}
                    </td>

                    {/* Title + Description */}
                    <td className="content-title-cell">

                      <strong>
                        {item.title}
                      </strong>

                      <span>
                        {item.description}
                      </span>

                    </td>

                    {/* Category */}
                    <td>

                      <span className="content-category">
                        {item.category}
                      </span>

                    </td>

                    {/* Status */}
                    <td>

                      <span
                        className={`content-status ${
                          item.status === "Published"
                            ? "published"
                            : "draft"
                        }`}
                      >
                        {item.status}
                      </span>

                    </td>

                    {/* Date */}
                    <td className="content-date">
                      {new Date(
                        item.created_at
                      ).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td>

                      <div className="content-table-actions">

                        <button
                          className="content-edit-button"
                          onClick={() =>
                            handleEdit(item)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="content-delete-button"
                          onClick={() =>
                            handleDelete(item.id)
                          }
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>
      {/* Customer Requests */}
      <div className="content-list-section"
      style={{ marginTop: "60px" }}>

        <div className="content-list-heading">

          <div>
            <p className="content-eyebrow">
              CUSTOMER REQUESTS
            </p>

            <h2>Service Requests</h2>
            <div className="request-filters">

              <input
                type="text"
                placeholder="Search requests..."
                value={requestSearch}
                onChange={(e) => setRequestSearch(e.target.value)}
              />

              <select
                value={requestStatus}
                onChange={(e) => setRequestStatus(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Review">In Review</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
              </select>

              <input
                type="date"
                value={requestDate}
                onChange={(e) => setRequestDate(e.target.value)}
              />
            </div>
          </div>

          <span className="content-count">
            {requests.length}{" "}
            {requests.length === 1 ? "request" : "requests"}
          </span>

        </div>

        {requests.length === 0 ? (
          <div className="empty-content">
            <p>No customer requests available yet.</p>
          </div>
        ) : (

          <div className="content-table-wrapper">

            <table className="content-table">

              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Request</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>

              <tbody>

                {requests.map((request, index) => (

                  <tr key={request.id}>

                    <td className="content-number">
                      {index + 1}
                    </td>

                    <td className="content-title-cell">

                      <strong>
                        {request.full_name}
                      </strong>

                      <span>
                        {request.email}
                      </span>

                    </td>

                    <td className="content-title-cell">

                      <strong>
                        {request.title}
                      </strong>

                      <span>
                        {request.description}
                      </span>

                    </td>

                    <td>
                      <span className="content-category">
                        {request.category}
                      </span>
                    </td>

                    <td>
                      <select
                        value={request.status}
                        onChange={(e) =>
                          handleRequestStatusChange(
                            request.id,
                            e.target.value
                          )
                        }
                        style={{
                          padding: "8px 10px",
                          borderRadius: "6px",
                          border: "1px solid rgba(255,255,255,0.1)",
                          background: "#0a0c10",
                          color: "#ffffff",
                          cursor: "pointer",
                        }}
                      >

                        <option value="Pending">
                          Pending
                        </option>

                        <option value="In Review">
                          In Review
                        </option>

                        <option value="In Progress">
                          In Progress
                        </option>

                        <option value="Completed">
                          Completed
                        </option>

                        <option value="Rejected">
                          Rejected
                        </option>

                      </select>

                    </td>

                    <td className="content-date">
                      {new Date(
                        request.created_at
                      ).toLocaleDateString()}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default Content;