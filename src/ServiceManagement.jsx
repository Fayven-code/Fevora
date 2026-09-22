import { useEffect, useState } from "react";

function ServiceManagement() {
  const [services, setServices] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  // Fetch all services
  const fetchServices = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/services", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch services.");
      }

      setServices(data);
    } catch (error) {
      console.error("Error fetching services:", error);
      setMessage(error.message);
    }
  };

  // Load services when page opens
  useEffect(() => {
    fetchServices();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Create or update service
  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = editingId
      ? `http://localhost:5000/api/services/${editingId}`
      : "http://localhost:5000/api/services";

    const method = editingId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setMessage(data.message);

      // Clear form
      setFormData({
        name: "",
        description: "",
        category: "",
      });

      setEditingId(null);

      // Refresh service list
      fetchServices();

      // Clear message
      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error("Service error:", error);
      setMessage(error.message);
    }
  };

  // Edit service
  const handleEdit = (service) => {
    setEditingId(service.id);

    setFormData({
      name: service.name,
      description: service.description,
      category: service.category || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Delete service
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this service?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/services/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete service.");
      }

      setMessage(data.message);

      // Refresh list
      fetchServices();

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error("Delete error:", error);
      setMessage(error.message);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingId(null);

    setFormData({
      name: "",
      description: "",
      category: "",
    });
  };

  return (
    <div className="service-management">
      <div className="service-management-container">

        <div className="service-header">
          <p className="service-eyebrow">ADMIN MANAGEMENT</p>

          <h1>Service Management</h1>

          <p>
            Create, update, and manage the services offered by Fevora.
          </p>
        </div>

        {message && (
          <div className="service-message">
            {message}
          </div>
        )}

        {/* Service Form */}
        <div className="service-form-card">

          <h2>
            {editingId ? "Edit Service" : "Add New Service"}
          </h2>

          <form onSubmit={handleSubmit}>

            <div className="service-form-grid">

              <div className="service-field">
                <label>Service Name</label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Web Development"
                  required
                />
              </div>

              <div className="service-field">
                <label>Category</label>

                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g. Development"
                />
              </div>

            </div>

            <div className="service-field">
              <label>Description</label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe this service..."
                rows="4"
                required
              />
            </div>

            <div className="service-form-buttons">

              <button type="submit" className="service-primary-button">
                {editingId ? "Update Service" : "Add Service"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="service-cancel-button"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              )}

            </div>

          </form>
        </div>

        {/* Services Table */}
        <div className="service-table-card">

          <div className="service-table-header">
            <div>
              <p className="service-eyebrow">CURRENT SERVICES</p>
              <h2>All Services</h2>
            </div>

            <span>
              {services.length} service
              {services.length !== 1 ? "s" : ""}
            </span>
          </div>

          {services.length === 0 ? (
            <div className="empty-services">
              No services have been added yet.
            </div>
          ) : (
            <div className="service-table-wrapper">

              <table>

                <thead>
                  <tr>
                    <th>#</th>
                    <th>Service</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {services.map((service, index) => (
                    <tr key={service.id}>

                      <td>{index + 1}</td>

                      <td className="service-name">
                        {service.name}
                      </td>

                      <td>
                        {service.category || "—"}
                      </td>

                      <td className="service-description">
                        {service.description}
                      </td>

                      <td>
                        <div className="service-actions">

                          <button
                            className="edit-service-button"
                            onClick={() => handleEdit(service)}
                          >
                            Edit
                          </button>

                          <button
                            className="delete-service-button"
                            onClick={() => handleDelete(service.id)}
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
    </div>
  );
}

export default ServiceManagement;