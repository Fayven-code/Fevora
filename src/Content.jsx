import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Content() {
    const navigate = useNavigate();
  const [content, setContent] = useState([]);

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

  // Load content when page opens
  useEffect(() => {
    fetchContent();
  }, []);

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

    </div>
  );
}

export default Content;