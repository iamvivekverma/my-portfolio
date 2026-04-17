import { useCallback, useEffect, useState } from "react";
import { portfolioApi } from "../services/api";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "/api").trim().replace(/\/+$/, "");
const ADMIN_TOKEN_KEY = "portfolio_admin_token";

const sections = [
  { key: "projects", label: "Projects" },
  { key: "skills", label: "Skills" },
  { key: "experience", label: "Experience" },
  { key: "about", label: "About" },
];

function buildApiUrl(path) {
  return `${API_BASE}/${path.replace(/^\/+/, "")}`;
}

async function readResponseBody(response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function getStoredAdminToken() {
  return window.sessionStorage.getItem(ADMIN_TOKEN_KEY) || "";
}

function storeAdminToken(token) {
  if (token) {
    window.sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  } else {
    window.sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  }
}

function createEmptyProjectForm() {
  return {
    title: "",
    description: "",
    technologies: "",
    liveLink: "",
    githubLink: "",
    badge: "",
    pin: "",
    image: "",
  };
}

function createProjectFormState(initial) {
  if (!initial) {
    return createEmptyProjectForm();
  }

  return {
    title: initial.title || "",
    description: initial.description || "",
    technologies: initial.technologies?.join(", ") || "",
    liveLink: initial.liveLink || "",
    githubLink: initial.githubLink || "",
    badge: initial.badge || "",
    pin: initial.pin || "",
    image: initial.image || "",
  };
}

function createAboutFormState(initial) {
  return {
    headline: initial?.headline || "",
    bio: initial?.bio || "",
    location: initial?.location || "",
    email: initial?.email || "",
    linkedin: initial?.socials?.linkedin || "",
    github: initial?.socials?.github || "",
    instagram: initial?.socials?.instagram || "",
    youtube: initial?.socials?.youtube || "",
    availability: initial?.availability || "",
  };
}

export default function Admin() {
  const [adminToken, setAdminToken] = useState(() => getStoredAdminToken());
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [active, setActive] = useState("projects");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [data, setData] = useState({
    projects: [],
    skills: [],
    experience: [],
    about: null,
  });

  const isLoggedIn = Boolean(adminToken);

  const resetSession = (message = "") => {
    storeAdminToken("");
    setAdminToken("");
    setLoginPassword("");
    setEditingItem(null);
    setData({
      projects: [],
      skills: [],
      experience: [],
      about: null,
    });
    setLoginError(message);
  };

  const authHeaders = adminToken
    ? {
        "Content-Type": "application/json",
        "x-admin-token": adminToken,
      }
    : {
        "Content-Type": "application/json",
      };

  const fetchData = useCallback(async (resource, token = adminToken) => {
    if (!token) {
      return;
    }

    try {
      const res = await fetch(buildApiUrl(resource), {
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
      });
      const json = await readResponseBody(res);

      if (res.status === 401) {
        resetSession("Session expired. Please log in again.");
        return;
      }

      setData((prev) => ({
        ...prev,
        [resource]: resource === "about" ? json?.data ?? null : json?.data ?? [],
      }));
    } catch (fetchError) {
      console.error(fetchError);
    }
  }, [adminToken]);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    sections.forEach((section) => {
      fetchData(section.key);
    });
  }, [fetchData, isLoggedIn]);

  const runAuthedRequest = async (path, options = {}) => {
    const res = await fetch(buildApiUrl(path), {
      ...options,
      headers: {
        ...authHeaders,
        ...(options.headers || {}),
      },
    });

    const body = await readResponseBody(res);

    if (res.status === 401) {
      resetSession("Session expired. Please log in again.");
      throw new Error(body?.message || "Session expired. Please log in again.");
    }

    return { res, body };
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");

    portfolioApi
      .verifyAdminSecret(loginPassword)
      .then((response) => {
        if (!response?.token) {
          throw new Error("No admin session token received");
        }

        storeAdminToken(response.token);
        setAdminToken(response.token);
        setLoginPassword("");
      })
      .catch((loginErr) => {
        setLoginError(loginErr.message || "Incorrect password");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleLogout = () => {
    resetSession("");
  };

  const handleProjectCreate = async (payload) => {
    setLoading(true);
    setError("");

    try {
      const { res, body } = await runAuthedRequest("projects", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess("Project created successfully!");
        setTimeout(() => setSuccess(""), 3000);
        fetchData("projects");
      } else {
        setError(body?.message || "Failed to create project");
      }
    } catch (requestError) {
      setError(`Error creating project: ${requestError.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSkillCreate = async (payload) => {
    setLoading(true);
    setError("");

    try {
      const { res, body } = await runAuthedRequest("skills", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess("Skill created successfully!");
        setTimeout(() => setSuccess(""), 3000);
        fetchData("skills");
      } else {
        setError(body?.message || "Failed to create skill");
      }
    } catch (requestError) {
      setError(`Error creating skill: ${requestError.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExperienceCreate = async (payload) => {
    setLoading(true);
    setError("");

    try {
      const { res, body } = await runAuthedRequest("experience", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess("Experience created successfully!");
        setTimeout(() => setSuccess(""), 3000);
        fetchData("experience");
      } else {
        setError(body?.message || "Failed to create experience");
      }
    } catch (requestError) {
      setError(`Error creating experience: ${requestError.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAboutSave = async (payload) => {
    setLoading(true);
    setError("");

    try {
      const { res, body } = await runAuthedRequest("about", {
        method: data.about?._id ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess("About saved successfully!");
        setTimeout(() => setSuccess(""), 3000);
        fetchData("about");
      } else {
        setError(body?.message || "Failed to save about");
      }
    } catch (requestError) {
      setError(`Error saving about: ${requestError.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (resource, id) => {
    if (!confirm("Are you sure you want to delete this item?")) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { res, body } = await runAuthedRequest(`${resource}/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setSuccess("Deleted successfully!");
        setTimeout(() => setSuccess(""), 3000);
        fetchData(resource);
      } else {
        setError(body?.message || "Failed to delete");
      }
    } catch (requestError) {
      setError(`Error deleting: ${requestError.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (resource, item) => {
    setEditingItem({ resource, item });
    setError("");
  };

  const handleUpdate = async (resource, id, formData) => {
    setLoading(true);
    setError("");

    try {
      const { res, body } = await runAuthedRequest(`${resource}/${id}`, {
        method: "PUT",
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess("Updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
        fetchData(resource);
        setEditingItem(null);
      } else {
        setError(body?.message || "Failed to update");
      }
    } catch (requestError) {
      setError(`Error updating: ${requestError.message}`);
    } finally {
      setLoading(false);
    }
  };

  const Forms = {
    projects: ProjectForm,
    skills: SkillForm,
    experience: ExperienceForm,
    about: AboutForm,
  }[active];

  const formInitial =
    active === "about" ? data.about : editingItem?.resource === active ? editingItem.item : null;
  const formKey = `${active}:${formInitial?._id || "new"}`;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-5">
        <div className="w-full max-w-md">
          <div className="bg-white border border-primary/10 rounded-2xl p-8 shadow-sm">
            <h1
              className="text-3xl font-bold text-primary mb-2 text-center"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Admin Login
            </h1>
            <p className="text-primary/60 text-center mb-6">
              Enter your password to access the admin panel
            </p>

            {loginError && (
              <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-4">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">Password</label>
                <input
                  type="password"
                  placeholder="Enter admin password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full border border-primary/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--color-primary)] text-white px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Checking..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-5 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2" style={{ fontFamily: "var(--font-display)" }}>
              Admin Panel
            </h1>
            <p className="text-primary/60">Manage your portfolio content</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>

        {success && (
          <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-xl mb-6">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {sections.map((section) => (
            <button
              key={section.key}
              onClick={() => {
                setActive(section.key);
                setEditingItem(null);
                setError("");
              }}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                active === section.key
                  ? "bg-[var(--color-accent)] text-primary"
                  : "bg-white text-primary/60 border border-primary/10 hover:border-primary/30"
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-primary/10 rounded-2xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-primary mb-6 capitalize" style={{ fontFamily: "var(--font-display)" }}>
              {active}
            </h2>
            <Forms
              key={formKey}
              onCreate={{
                projects: handleProjectCreate,
                skills: handleSkillCreate,
                experience: handleExperienceCreate,
                about: handleAboutSave,
              }[active]}
              onUpdate={{
                projects: (id, formData) => handleUpdate("projects", id, formData),
                skills: (id, formData) => handleUpdate("skills", id, formData),
                experience: (id, formData) => handleUpdate("experience", id, formData),
              }[active]}
              initial={formInitial}
              isEditing={active !== "about" && editingItem?.resource === active}
              onCancelEdit={() => setEditingItem(null)}
              loading={loading}
            />
          </div>

          <div className="bg-white border border-primary/10 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-primary mb-4">Existing Items</h3>

            {["projects", "skills", "experience"].includes(active) &&
              (data[active]?.length ? (
                <ul className="space-y-2">
                  {data[active].map((item) => (
                    <li
                      key={item._id}
                      className="flex items-center justify-between bg-primary/5 border border-primary/10 rounded-xl px-4 py-3"
                    >
                      <span className="text-sm text-primary font-medium">
                        {item.title || item.name || item.year}
                      </span>
                      <div className="flex gap-2">
                        <button
                          className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-200 transition-colors"
                          onClick={() => handleEdit(active, item)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-lg hover:bg-red-200 transition-colors"
                          onClick={() => handleDelete(active, item._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-primary/40 text-center py-4">No entries yet</p>
              ))}

            {active === "about" && (
              <pre className="text-xs bg-primary/5 border border-primary/10 rounded-xl p-4 overflow-auto text-primary">
                {JSON.stringify(data.about, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectForm({ onCreate, onUpdate, initial, isEditing, onCancelEdit, loading }) {
  const [form, setForm] = useState(() => createProjectFormState(initial));
  const [imagePreview, setImagePreview] = useState(initial?.image || "");
  const [hasNewImage, setHasNewImage] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((current) => ({ ...current, image: reader.result }));
      setImagePreview(reader.result);
      setHasNewImage(true);
      setSubmitError("");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitError("");

    const data = {
      title: form.title.trim(),
      description: form.description.trim(),
      technologies: form.technologies
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      liveLink: form.liveLink.trim() || null,
      githubLink: form.githubLink.trim() || null,
      badge: form.badge.trim() || null,
      pin: form.pin.trim() || null,
    };

    if (!data.title || !data.description) {
      setSubmitError("Title and description are required.");
      return;
    }

    if (hasNewImage && form.image && form.image.startsWith("data:")) {
      if (form.image.length > 5000000) {
        setSubmitError("Image too large. Please use a smaller image (max 5MB).");
        return;
      }

      data.image = form.image;
    } else if (!isEditing) {
      data.image = form.image || null;
    }

    if (JSON.stringify(data).length > 10000000) {
      setSubmitError("Data too large. Please remove the image or use a smaller one.");
      return;
    }

    if (isEditing && initial?._id) {
      onUpdate(initial._id, data);
    } else {
      onCreate(data);
      setForm(createEmptyProjectForm());
      setImagePreview("");
      setHasNewImage(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {submitError && (
        <div className="rounded-xl border border-red-300 bg-red-100 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}
      <Input label="Title" value={form.title} onChange={(value) => setForm({ ...form, title: value })} />
      <Textarea label="Description" value={form.description} onChange={(value) => setForm({ ...form, description: value })} />
      <Input
        label="Technologies (comma separated)"
        value={form.technologies}
        onChange={(value) => setForm({ ...form, technologies: value })}
      />
      <Input label="Badge (e.g., Open source, NDA - Confidential)" value={form.badge} onChange={(value) => setForm({ ...form, badge: value })} />
      <Input label="Live URL" value={form.liveLink} onChange={(value) => setForm({ ...form, liveLink: value })} />
      <Input label="GitHub URL" value={form.githubLink} onChange={(value) => setForm({ ...form, githubLink: value })} />
      <Input
        label="Project PIN (4 digits, leave empty for no PIN required)"
        type="password"
        maxLength={4}
        value={form.pin}
        onChange={(value) => setForm({ ...form, pin: value.replace(/[^0-9]/g, "") })}
      />
      <div>
        <label className="block text-sm font-medium text-primary mb-2">Project Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="block w-full text-sm text-primary/60 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
        />
        {imagePreview && (
          <div className="mt-3">
            <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg border border-primary/20" />
          </div>
        )}
      </div>
      <div className="flex gap-3">
        {isEditing && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="bg-gray-100 text-primary px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          disabled={loading}
          className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1"
        >
          {loading ? "Saving..." : isEditing ? "Update Project" : "Save Project"}
        </button>
      </div>
    </form>
  );
}

function SkillForm({ onCreate, loading }) {
  const [form, setForm] = useState({
    name: "",
    level: 0,
    category: "",
    icon: "",
    order: 0,
    color: "",
    desc: "",
  });

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onCreate(form);
        setForm({ name: "", level: 0, category: "", icon: "", order: 0, color: "", desc: "" });
      }}
    >
      <Input label="Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
      <Input label="Level (0-100)" type="number" value={form.level} onChange={(value) => setForm({ ...form, level: Number(value) })} />
      <Input label="Category (Frontend, Backend, Database, Tools)" value={form.category} onChange={(value) => setForm({ ...form, category: value })} />
      <Input label="Color (hex code, e.g., #61DAFB)" value={form.color} onChange={(value) => setForm({ ...form, color: value })} />
      <Input label="Icon (optional URL or name)" value={form.icon} onChange={(value) => setForm({ ...form, icon: value })} />
      <Input label="Description" value={form.desc} onChange={(value) => setForm({ ...form, desc: value })} />
      <Input label="Order" type="number" value={form.order} onChange={(value) => setForm({ ...form, order: Number(value) })} />
      <button
        disabled={loading}
        className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Saving..." : "Save Skill"}
      </button>
    </form>
  );
}

function ExperienceForm({ onCreate, loading }) {
  const [form, setForm] = useState({
    number: "",
    era: "",
    category: "",
    title: "",
    subtitle: "",
    body: "",
    tags: "",
    statValue: "",
    statLabel: "",
    isPulse: false,
  });

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onCreate({
          ...form,
          tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
          stat: { value: form.statValue, label: form.statLabel },
          isPulse: form.isPulse,
        });
        setForm({
          number: "",
          era: "",
          category: "",
          title: "",
          subtitle: "",
          body: "",
          tags: "",
          statValue: "",
          statLabel: "",
          isPulse: false,
        });
      }}
    >
      <Input label="Number (e.g., 01, 02)" value={form.number} onChange={(value) => setForm({ ...form, number: value })} />
      <Input label="Era (e.g., 2020 - 2023, 2025, Present)" value={form.era} onChange={(value) => setForm({ ...form, era: value })} />
      <Input label="Category (e.g., EDUCATION, TRANSITION, SKILL, NOW)" value={form.category} onChange={(value) => setForm({ ...form, category: value })} />
      <Input label="Title" value={form.title} onChange={(value) => setForm({ ...form, title: value })} />
      <Input label="Subtitle" value={form.subtitle} onChange={(value) => setForm({ ...form, subtitle: value })} />
      <Textarea label="Body" value={form.body} onChange={(value) => setForm({ ...form, body: value })} />
      <Input label="Tags (comma separated)" value={form.tags} onChange={(value) => setForm({ ...form, tags: value })} />
      <Input label="Stat Value (e.g., 3, 7th, MERN)" value={form.statValue} onChange={(value) => setForm({ ...form, statValue: value })} />
      <Input label="Stat Label (e.g., Years of engineering foundation)" value={form.statLabel} onChange={(value) => setForm({ ...form, statLabel: value })} />
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.isPulse}
          onChange={(e) => setForm({ ...form, isPulse: e.target.checked })}
          className="w-4 h-4"
        />
        <label className="text-sm text-primary">Pulse animation</label>
      </div>
      <button
        disabled={loading}
        className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Saving..." : "Save Experience"}
      </button>
    </form>
  );
}

function AboutForm({ onCreate, initial, loading }) {
  const [form, setForm] = useState(() => createAboutFormState(initial));

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onCreate({
          headline: form.headline,
          bio: form.bio,
          location: form.location,
          email: form.email,
          socials: {
            linkedin: form.linkedin,
            github: form.github,
            instagram: form.instagram,
            youtube: form.youtube,
          },
          availability: form.availability,
        });
      }}
    >
      <Input label="Headline" value={form.headline} onChange={(value) => setForm({ ...form, headline: value })} />
      <Textarea label="Bio" value={form.bio} onChange={(value) => setForm({ ...form, bio: value })} />
      <Input label="Location" value={form.location} onChange={(value) => setForm({ ...form, location: value })} />
      <Input label="Email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
      <Input label="LinkedIn" value={form.linkedin} onChange={(value) => setForm({ ...form, linkedin: value })} />
      <Input label="GitHub" value={form.github} onChange={(value) => setForm({ ...form, github: value })} />
      <Input label="Instagram" value={form.instagram} onChange={(value) => setForm({ ...form, instagram: value })} />
      <Input label="YouTube" value={form.youtube} onChange={(value) => setForm({ ...form, youtube: value })} />
      <Input label="Availability" value={form.availability} onChange={(value) => setForm({ ...form, availability: value })} />
      <button
        disabled={loading}
        className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Saving..." : "Save About"}
      </button>
    </form>
  );
}

function Input({ label, value, onChange, type = "text", maxLength }) {
  return (
    <label className="block text-sm font-semibold text-primary mb-2">
      {label}
      <input
        type={type}
        maxLength={maxLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border border-primary/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-primary"
      />
    </label>
  );
}

function Textarea({ label, value, onChange }) {
  return (
    <label className="block text-sm font-semibold text-primary mb-2">
      {label}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="mt-1 w-full border border-primary/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-primary resize-none"
      />
    </label>
  );
}
