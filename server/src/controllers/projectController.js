const prisma = require('../config/db');

// @desc    Get all projects (User sees owned and member projects)
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: req.user.id },
          { members: { some: { id: req.user.id } } }
        ]
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { select: { id: true, name: true, email: true } },
        _count: { select: { tasks: true } }
      }
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { select: { id: true, name: true, email: true } },
        tasks: { include: { user: { select: { name: true } } } }
      }
    });

    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    // Check access
    const isOwner = project.ownerId === req.user.id;
    const isMember = project.members.some(m => m.id === req.user.id);
    if (!isOwner && !isMember && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Private/Admin
const createProject = async (req, res) => {
  const { title, description, deadline } = req.body;

  try {
    const project = await prisma.project.create({
      data: {
        title,
        description,
        deadline: deadline ? new Date(deadline) : null,
        ownerId: req.user.id,
        members: { connect: { id: req.user.id } } // Owner is also a member
      }
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Admin
const updateProject = async (req, res) => {
  const { title, description, deadline } = req.body;

  try {
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        deadline: deadline ? new Date(deadline) : null
      }
    });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
const deleteProject = async (req, res) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ message: 'Project removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private/Admin
const addMember = async (req, res) => {
  const { userId } = req.body;
  try {
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        members: { connect: { id: userId } }
      },
      include: { members: true }
    });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private/Admin
const removeMember = async (req, res) => {
  try {
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        members: { disconnect: { id: req.params.userId } }
      },
      include: { members: true }
    });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember
};
