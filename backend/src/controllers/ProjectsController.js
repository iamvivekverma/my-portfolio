const mongoose = require('mongoose');
const { messages } = require('../constants/messages');
const { createHttpError } = require('../lib/httpError');
const { ProjectModel } = require('../models/ProjectsModel');
const {
  createProjectAccessToken,
  resolveAdminAccess,
  verifyProjectAccessToken,
} = require('../middlewares/adminAuth');

function ensureValidProjectId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createHttpError(400, 'Invalid project ID format');
  }
}

function getProjectAccessTokenFromRequest(req) {
  const headerToken = req.headers['x-project-access-token'];
  const queryToken = typeof req.query?.accessToken === 'string' ? req.query.accessToken : '';

  return headerToken || queryToken || '';
}

function normalizeRequiredString(value, fieldName, maxLength = 500) {
  if (typeof value !== 'string') {
    throw createHttpError(400, `${fieldName} must be a string.`);
  }

  const trimmed = value.trim();

  if (!trimmed) {
    throw createHttpError(400, `${fieldName} is required.`);
  }

  if (trimmed.length > maxLength) {
    throw createHttpError(400, `${fieldName} is too long.`);
  }

  return trimmed;
}

function normalizeOptionalString(value, fieldName, maxLength = 500) {
  if (value == null || value === '') {
    return null;
  }

  if (typeof value !== 'string') {
    throw createHttpError(400, `${fieldName} must be a string.`);
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.length > maxLength) {
    throw createHttpError(400, `${fieldName} is too long.`);
  }

  return trimmed;
}

function normalizeUrl(value, fieldName) {
  const normalized = normalizeOptionalString(value, fieldName, 2048);

  if (!normalized) {
    return null;
  }

  if (
    normalized.startsWith('http://') ||
    normalized.startsWith('https://') ||
    normalized.startsWith('/')
  ) {
    return normalized;
  }

  throw createHttpError(400, `${fieldName} must be an absolute URL or a site-relative path.`);
}

function normalizeTechnologies(value) {
  if (value == null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw createHttpError(400, 'Technologies must be an array of strings.');
  }

  return Array.from(
    new Set(
      value
        .map((item) => {
          if (typeof item !== 'string') {
            throw createHttpError(400, 'Each technology must be a string.');
          }

          return item.trim();
        })
        .filter(Boolean),
    ),
  );
}

function normalizePin(value) {
  if (value == null || value === '') {
    return null;
  }

  if (typeof value !== 'string') {
    throw createHttpError(400, 'Project PIN must be a string.');
  }

  const trimmed = value.trim();

  if (!/^\d{4}$/.test(trimmed)) {
    throw createHttpError(400, 'Project PIN must be exactly 4 digits.');
  }

  return trimmed;
}

function normalizeImage(value) {
  const normalized = normalizeOptionalString(value, 'Project image', 10000000);

  if (!normalized) {
    return null;
  }

  if (
    normalized.startsWith('data:') ||
    normalized.startsWith('http://') ||
    normalized.startsWith('https://') ||
    normalized.startsWith('/')
  ) {
    return normalized;
  }

  throw createHttpError(
    400,
    'Invalid image format. Use a data URL, absolute URL, or site-relative path.',
  );
}

function normalizeOrder(value, fallback = 0) {
  if (value == null || value === '') {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 0) {
    throw createHttpError(400, 'Order must be a non-negative integer.');
  }

  return parsed;
}

function isProtectedImageSource(value) {
  return typeof value === 'string' && value.startsWith('data:');
}

function normalizeProjectInput(payload, { existingProject = null, partial = false } = {}) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw createHttpError(400, 'Invalid project payload.');
  }

  const base = existingProject
    ? {
        title: existingProject.title,
        description: existingProject.description,
        fullDescription: existingProject.fullDescription || null,
        technologies: Array.isArray(existingProject.technologies) ? existingProject.technologies : [],
        liveLink: existingProject.liveLink || null,
        githubLink: existingProject.githubLink || null,
        badge: existingProject.badge || null,
        pin: existingProject.pin || null,
        image: existingProject.image || null,
        order: typeof existingProject.order === 'number' ? existingProject.order : 0,
      }
    : {
        title: '',
        description: '',
        fullDescription: null,
        technologies: [],
        liveLink: null,
        githubLink: null,
        badge: null,
        pin: null,
        image: null,
        order: 0,
      };

  const next = { ...base };

  if (!partial || Object.hasOwn(payload, 'title')) {
    next.title = normalizeRequiredString(payload.title, 'Title', 160);
  }

  if (!partial || Object.hasOwn(payload, 'description')) {
    next.description = normalizeRequiredString(payload.description, 'Description', 1000);
  }

  if (!partial || Object.hasOwn(payload, 'fullDescription')) {
    next.fullDescription = normalizeOptionalString(payload.fullDescription, 'Full description', 6000);
  }

  if (!partial || Object.hasOwn(payload, 'technologies')) {
    next.technologies = normalizeTechnologies(payload.technologies);
  }

  if (!partial || Object.hasOwn(payload, 'liveLink')) {
    next.liveLink = normalizeUrl(payload.liveLink, 'Live URL');
  }

  if (!partial || Object.hasOwn(payload, 'githubLink')) {
    next.githubLink = normalizeUrl(payload.githubLink, 'GitHub URL');
  }

  if (!partial || Object.hasOwn(payload, 'badge')) {
    next.badge = normalizeOptionalString(payload.badge, 'Badge', 120);
  }

  if (!partial || Object.hasOwn(payload, 'pin')) {
    next.pin = normalizePin(payload.pin);
  }

  if (!partial || Object.hasOwn(payload, 'image')) {
    next.image = normalizeImage(payload.image);
  }

  if (!partial || Object.hasOwn(payload, 'order')) {
    next.order = normalizeOrder(payload.order, base.order);
  }

  if (next.pin && next.image && !isProtectedImageSource(next.image)) {
    throw createHttpError(
      400,
      'Locked projects must use an uploaded image so previews stay protected.',
    );
  }

  return next;
}

function normalizeProjectListItem(project) {
  const {
    _id,
    title,
    description,
    technologies,
    badge,
    order,
    createdAt,
    pin,
  } = project;

  return {
    _id,
    title,
    description,
    technologies,
    badge,
    order,
    createdAt,
    isLocked: Boolean(pin),
  };
}

function normalizeProjectDetail(project, { isAdmin = false } = {}) {
  const { pin, ...rest } = project;

  if (isAdmin) {
    return {
      ...rest,
      pin: pin || null,
      isLocked: Boolean(pin),
    };
  }

  return {
    ...rest,
    image: pin && rest.image && !isProtectedImageSource(rest.image) ? null : rest.image,
    isLocked: Boolean(pin),
  };
}

function sendLockedProjectResponse(res) {
  return res.status(403).json({
    success: false,
    locked: true,
    message: 'Project is locked',
  });
}

function handleProjectError(res, error) {
  if (error?.status) {
    return res.status(error.status).json({
      success: false,
      message: error.message,
      ...(error.details ? { details: error.details } : {}),
    });
  }

  if (error?.name === 'ValidationError') {
    const errors = Object.values(error.errors).map((item) => item.message);

    return res.status(400).json({
      success: false,
      message: errors.join(', ') || 'Invalid project payload.',
    });
  }

  if (error?.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid data type for field: ${error.path}`,
    });
  }

  return res.status(500).json({
    success: false,
    message: error?.message || messages.catch_error.msg,
  });
}

function resolveReadAccess(req) {
  return resolveAdminAccess(req.headers['x-admin-token']);
}

const getData = async (req, res) => {
  try {
    const adminAccess = resolveReadAccess(req);

    if (!adminAccess.ok) {
      return res.status(adminAccess.status).json({
        success: false,
        message: adminAccess.message,
      });
    }

    const projects = await ProjectModel.find()
      .sort({ order: 1, createdAt: 1 })
      .lean();

    const data = adminAccess.isAdmin ? projects.map((project) => normalizeProjectDetail(project, { isAdmin: true })) : projects.map(normalizeProjectListItem);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return handleProjectError(res, error);
  }
};

const getImageById = async (req, res) => {
  try {
    const { id } = req.params;
    ensureValidProjectId(id);

    const adminAccess = resolveReadAccess(req);

    if (!adminAccess.ok) {
      return res.status(adminAccess.status).json({
        success: false,
        message: adminAccess.message,
      });
    }

    const project = await ProjectModel.findById(id).select('image pin').lean();

    if (!project?.image) {
      return res.status(404).json({ success: false, message: 'Project image not found' });
    }

    if (project.pin && !adminAccess.isAdmin) {
      const accessResult = verifyProjectAccessToken(getProjectAccessTokenFromRequest(req), id);

      if (!accessResult.ok) {
        return sendLockedProjectResponse(res);
      }
    }

    if (project.pin && !adminAccess.isAdmin && !isProtectedImageSource(project.image)) {
      return res.status(404).json({ success: false, message: 'Project image not available' });
    }

    res.setHeader('Cache-Control', 'public, max-age=86400');

    if (project.image.startsWith('data:')) {
      const match = project.image.match(/^data:([^;]+);base64,(.+)$/);

      if (!match) {
        return res.status(400).json({ success: false, message: 'Invalid project image data' });
      }

      const [, contentType, base64Data] = match;
      const imageBuffer = Buffer.from(base64Data, 'base64');

      res.setHeader('Content-Type', contentType);
      return res.send(imageBuffer);
    }

    return res.redirect(project.image);
  } catch (error) {
    return handleProjectError(res, error);
  }
};

const getDataById = async (req, res) => {
  try {
    const { id } = req.params;
    ensureValidProjectId(id);

    const adminAccess = resolveReadAccess(req);

    if (!adminAccess.ok) {
      return res.status(adminAccess.status).json({
        success: false,
        message: adminAccess.message,
      });
    }

    const project = await ProjectModel.findById(id).lean();

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.pin && !adminAccess.isAdmin) {
      const accessResult = verifyProjectAccessToken(getProjectAccessTokenFromRequest(req), id);

      if (!accessResult.ok) {
        return sendLockedProjectResponse(res);
      }
    }

    return res.status(200).json({
      success: true,
      data: normalizeProjectDetail(project, { isAdmin: adminAccess.isAdmin }),
    });
  } catch (error) {
    return handleProjectError(res, error);
  }
};

const createData = async (req, res) => {
  try {
    const payload = normalizeProjectInput(req.body);
    const project = await ProjectModel.create(payload);

    return res.status(201).json({
      success: true,
      data: normalizeProjectDetail(project.toObject(), { isAdmin: true }),
    });
  } catch (error) {
    return handleProjectError(res, error);
  }
};

const updateData = async (req, res) => {
  try {
    const { id } = req.params;
    ensureValidProjectId(id);

    const existingProject = await ProjectModel.findById(id).lean();

    if (!existingProject) {
      return res.status(404).json({ success: false, message: messages.not_found.msg });
    }

    const payload = normalizeProjectInput(req.body, {
      existingProject,
      partial: true,
    });

    const project = await ProjectModel.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    }).lean();

    return res.json({
      success: true,
      data: normalizeProjectDetail(project, { isAdmin: true }),
    });
  } catch (error) {
    return handleProjectError(res, error);
  }
};

const deleteData = async (req, res) => {
  try {
    const { id } = req.params;
    ensureValidProjectId(id);

    const deleted = await ProjectModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: messages.not_found.msg });
    }

    return res.json({ success: true });
  } catch (error) {
    return handleProjectError(res, error);
  }
};

const verifyPin = async (req, res) => {
  try {
    const { id } = req.params;
    ensureValidProjectId(id);

    const project = await ProjectModel.findById(id).select('pin').lean();

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (!project.pin) {
      return res.json({ success: true, unlocked: true });
    }

    const pin = normalizePin(req.body?.pin);

    if (project.pin !== pin) {
      return res.status(401).json({
        success: false,
        unlocked: false,
        message: 'Incorrect PIN',
      });
    }

    const accessToken = createProjectAccessToken(id);

    if (!accessToken.ok) {
      return res.status(accessToken.status).json({
        success: false,
        message: accessToken.message,
      });
    }

    return res.json({
      success: true,
      unlocked: true,
      accessToken: accessToken.token,
      expiresAt: accessToken.expiresAt,
    });
  } catch (error) {
    return handleProjectError(res, error);
  }
};

const reorderProjects = async (req, res) => {
  try {
    const { orders } = req.body;

    if (!Array.isArray(orders) || orders.length === 0) {
      throw createHttpError(400, 'Orders must be a non-empty array.');
    }

    const bulkOps = orders.map(({ id, order }) => {
      ensureValidProjectId(id);

      return {
        updateOne: {
          filter: { _id: id },
          update: { order: normalizeOrder(order) },
        },
      };
    });

    await ProjectModel.bulkWrite(bulkOps);

    return res.json({ success: true });
  } catch (error) {
    return handleProjectError(res, error);
  }
};

module.exports = {
  createData,
  deleteData,
  getData,
  getDataById,
  getImageById,
  reorderProjects,
  updateData,
  verifyPin,
};
