import { useEffect, useState } from "react";

function Projects() {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projectMembers, setProjectMembers] = useState({});

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Not Started");
  const [clientId, setClientId] = useState("");
  const [editingProject, setEditingProject] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState("Not Started");
  const [editClientId, setEditClientId] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchProjects = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/projects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to load projects.");
        return;
      }

      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setError("Unable to connect to the server.");
    }
  };

  const fetchClients = async () => {
    try {
        const response = await fetch(
        "http://localhost:5000/api/admin/project-clients",
        {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        }
        );

        const data = await response.json();

        if (!response.ok) {
        setError(data.error || "Unable to load customers.");
        return;
        }

        setClients(data);
    } catch (error) {
        console.error("Error fetching clients:", error);
        setError("Unable to connect to the server.");
    }
    };

    const fetchEmployees = async () => {
        try {
            const response = await fetch(
            "http://localhost:5000/api/admin/project-employees",
            {
                headers: {
                Authorization: `Bearer ${token}`,
                },
            }
            );

            const data = await response.json();

            if (!response.ok) {
            setError(data.error || "Unable to load employees.");
            return;
            }

            setEmployees(data);
        } catch (error) {
            console.error("Error fetching employees:", error);
            setError("Unable to connect to the server.");
        }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (!name.trim() || !description.trim() || !clientId) {
            setError("Project name, description, and client are required.");
            return;
        }

        try {
            const response = await fetch(
            "http://localhost:5000/api/admin/projects",
            {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                name,
                description,
                status,
                client_id: Number(clientId),
                }),
            }
            );

            const data = await response.json();

            if (!response.ok) {
            setError(data.error || "Unable to create project.");
            return;
            }

            setMessage("Project created successfully.");

            setName("");
            setDescription("");
            setStatus("Not Started");
            setClientId("");

            fetchProjects();
        } catch (error) {
            console.error("Error creating project:", error);
            setError("Unable to connect to the server.");
        }
    };

    const handleEditProject = (project) => {
        setEditingProject(project);
        setEditName(project.name);
        setEditDescription(project.description);
        setEditStatus(project.status);
        setEditClientId(project.client_id);
        setMessage("");
        setError("");
    };

    const handleUpdateProject = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (!editName.trim() || !editDescription.trim() || !editClientId) {
            setError("Project name, description, and client are required.");
            return;
        }

        try {
            const response = await fetch(
            `http://localhost:5000/api/admin/projects/${editingProject.id}`,
            {
                method: "PUT",
                headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                name: editName,
                description: editDescription,
                status: editStatus,
                client_id: Number(editClientId),
                }),
            }
            );

            const data = await response.json();

            if (!response.ok) {
            setError(data.error || "Unable to update project.");
            return;
            }

            setMessage("Project updated successfully.");

            setEditingProject(null);
            setEditName("");
            setEditDescription("");
            setEditStatus("Not Started");
            setEditClientId("");

            fetchProjects();
        } catch (error) {
            console.error("Error updating project:", error);
            setError("Unable to connect to the server.");
        }
    };

    const handleDeleteProject = async (projectId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this project?"
        );

        if (!confirmed) return;

        try {
            const response = await fetch(
            `http://localhost:5000/api/admin/projects/${projectId}`,
            {
                method: "DELETE",
                headers: {
                Authorization: `Bearer ${token}`,
                },
            }
            );

            const data = await response.json();

            if (!response.ok) {
            setError(data.error || "Unable to delete project.");
            return;
            }

            setMessage("Project deleted successfully.");
            fetchProjects();
        } catch (error) {
            console.error("Error deleting project:", error);
            setError("Unable to connect to the server.");
        }
    };

    const handleAssignEmployee = async (projectId, employeeId) => {
        setMessage("");
        setError("");

        try {
            const response = await fetch(
            `http://localhost:5000/api/admin/projects/${projectId}/members`,
            {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                user_id: employeeId,
                role: "Member",
                }),
            }
            );

            const data = await response.json();

            if (!response.ok) {
            setError(data.error || "Unable to assign employee.");
            return;
            }

            setMessage("Employee assigned successfully.");
        } catch (error) {
            console.error("Error assigning employee:", error);
            setError("Unable to connect to the server.");
        }
    };

    const fetchProjectMembers = async (projectId) => {
        try {
            const response = await fetch(
            `http://localhost:5000/api/admin/projects/${projectId}/members`,
            {
                headers: {
                Authorization: `Bearer ${token}`,
                },
            }
            );

            const data = await response.json();

            if (!response.ok) {
            setError(data.error || "Unable to load project members.");
            return;
            }

            setProjectMembers((prev) => ({
            ...prev,
            [projectId]: data,
            }));
        } catch (error) {
            console.error("Error fetching project members:", error);
            setError("Unable to connect to the server.");
        }
    };

    const handleRemoveEmployee = async (projectId, memberId) => {
        const confirmed = window.confirm(
            "Are you sure you want to remove this employee from the project?"
        );

        if (!confirmed) return;

        try {
            const response = await fetch(
            `http://localhost:5000/api/admin/projects/${projectId}/members/${memberId}`,
            {
                method: "DELETE",
                headers: {
                Authorization: `Bearer ${token}`,
                },
            }
            );

            const data = await response.json();

            if (!response.ok) {
            setError(data.error || "Unable to remove employee.");
            return;
            }

            setMessage("Employee removed successfully.");

            fetchProjectMembers(projectId);
        } catch (error) {
            console.error("Error removing employee:", error);
            setError("Unable to connect to the server.");
        }
    };

  useEffect(() => {
    fetchProjects();
    fetchClients();
    fetchEmployees();
  }, []);

  return (
    <div className="projects-page">
      <div className="projects-header">
        <p className="projects-eyebrow">PROJECT MANAGEMENT</p>
        <h1>Manage Client Projects</h1>
        <p>
            Create projects, assign clients and employees, and track project progress.
        </p>
      </div>

      <div className="project-form-card">

        <div className="project-section-heading">
            <p>NEW PROJECT</p>
            <h2>Create Project</h2>
        </div>

        <form onSubmit={handleCreateProject} className="project-form">
        <div>
            <label>Project Name</label>
            <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter project name"
            />
        </div>

        <div>
            <label>Description</label>
            <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter project description"
            />
        </div>

        <div>
            <label>Client</label>
            <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            >
            <option value="">Select a client</option>

            {clients.map((client) => (
                <option key={client.id} value={client.id}>
                {client.full_name} - {client.email}
                </option>
            ))}
            </select>
        </div>

        <div>
            <label>Status</label>
            <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            >
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
            </select>
        </div>

        <button type="submit">Create Project</button>
     </form>
     </div>

      <div className="project-message-area">
        {message && <p>{message}</p>}
        {error && <p>{error}</p>}
      </div>

      {projects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        <div>
          {projects.map((project) => (
            <div key={project.id} className="project-card">
              <div className="project-card-header">
                <div>
                    <p className="project-number">
                    PROJECT #{project.id}
                    </p>

                    <h2>{project.name}</h2>
                </div>

                <span className={`project-status ${project.status
                    .toLowerCase()
                    .replaceAll(" ", "-")}`}>
                    {project.status}
                </span>
              </div>

              <p>{project.description}</p>

              <p>
                <strong>Client:</strong> {project.client_name}
              </p>

              <p>
                <strong>Email:</strong> {project.client_email}
              </p>

              <div>
                <button onClick={() => handleEditProject(project)}>
                    Edit
                </button>

                <button onClick={() => handleDeleteProject(project.id)}>
                    Delete
                </button>
              </div>

              <div className="project-members-section">
                <div className="project-subheading">
                    <p>TEAM</p>
                    <h3>Assign Employee</h3>
                </div>

                <select
                    defaultValue=""
                    onChange={(e) => {
                    if (e.target.value) {
                        handleAssignEmployee(project.id, Number(e.target.value));
                        e.target.value = "";
                    }
                    }}
                >
                    <option value="">Select an employee</option>

                    {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                        {employee.full_name} - {employee.email}
                    </option>
                    ))}
                </select>
              </div>

              <div className="project-members-list">
                <div className="project-subheading">
                    <p>ASSIGNED TEAM</p>
                    <h3>Project Members</h3>
                </div>

                <button onClick={() => fetchProjectMembers(project.id)}>
                    View Members
                </button>

                {projectMembers[project.id]?.length > 0 ? (
                    <ul>
                    {projectMembers[project.id].map((member) => (
                        <li key={member.id}>
                            {member.full_name} - {member.email} ({member.role})

                            <button
                            onClick={() => handleRemoveEmployee(project.id, member.id)}
                            >
                            Remove
                            </button>
                        </li>
                    ))}
                    </ul>
                ) : (
                    projectMembers[project.id] && <p>No employees assigned.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {editingProject && (
        <div className="project-modal-overlay">
            <div className="project-modal">
            
            <div className="project-modal-header">
                <div>
                <p>EDIT PROJECT</p>
                <h2>Edit Project</h2>
                </div>

                <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="project-modal-close"
                >
                ×
                </button>
            </div>

            <form onSubmit={handleUpdateProject} className="project-form">

                <div>
                <label>Project Name</label>
                <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                />
                </div>

                <div>
                <label>Description</label>
                <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    required
                />
                </div>

                <div>
                <label>Client</label>

                <select
                    value={editClientId}
                    onChange={(e) => setEditClientId(e.target.value)}
                    required
                >
                    <option value="">Select a client</option>

                    {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                        {client.full_name} - {client.email}
                    </option>
                    ))}
                </select>
                </div>

                <div>
                <label>Status</label>

                <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                </select>
                </div>

                <div className="project-modal-actions">

                <button
                    type="button"
                    onClick={() => setEditingProject(null)}
                    className="project-cancel-button"
                >
                    Cancel
                </button>

                <button type="submit">
                    Save Changes
                </button>

                </div>

            </form>
          </div>
        </div>
        )}
    </div>
  );
}

export default Projects;