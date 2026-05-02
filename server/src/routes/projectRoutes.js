const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/')
  .get(protect, getProjects)
  .post(protect, authorize('ADMIN'), createProject);

router.route('/:id')
  .get(protect, getProjectById)
  .put(protect, authorize('ADMIN'), updateProject)
  .delete(protect, authorize('ADMIN'), deleteProject);

router.route('/:id/members')
  .post(protect, authorize('ADMIN'), addMember);

router.route('/:id/members/:userId')
  .delete(protect, authorize('ADMIN'), removeMember);

module.exports = router;
