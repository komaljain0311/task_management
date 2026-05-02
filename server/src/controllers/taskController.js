const prisma = require('../config/db');

// @desc    Get tasks for a project
// @route   GET /api/tasks?projectId=xxx
// @access  Private
const getTasks = async (req, res) => {
  const { projectId } = req.query;
  try {
    const tasks = await prisma.task.findMany({
      where: projectId ? { projectId } : { userId: req.user.id },
      include: {
        user: { select: { name: true, email: true } },
        project: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  const { title, description, status, priority, dueDate, userId, projectId } = req.body;

  try {
    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'To Do',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: userId || req.user.id,
        projectId
      }
    });

    // Create notification if assigned to someone else
    if (userId && userId !== req.user.id) {
      await prisma.notification.create({
        data: {
          userId,
          message: `You have been assigned a new task: ${title}`,
          type: 'ASSIGNMENT'
        }
      });
    }

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  const { title, description, status, priority, dueDate, userId } = req.body;

  try {
    const oldTask = await prisma.task.findUnique({ where: { id: req.params.id } });
    
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        userId
      }
    });

    // Notify if assignee changed
    if (userId && userId !== oldTask.userId && userId !== req.user.id) {
      await prisma.notification.create({
        data: {
          userId,
          message: `You have been assigned a new task: ${task.title}`,
          type: 'ASSIGNMENT'
        }
      });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask
};
