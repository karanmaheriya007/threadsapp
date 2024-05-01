import express from 'express';
import { followUnfollowUser, getFollowers, getFollowing, getUserProfile, loginUser, logoutUser, signupUser, updateUser } from '../controllers/userController.js';
import protectRoute from '../middlewares/protectRoute.js';

const router = express.Router();

// for checking endpoint work or not
// router.get('/signup', (req, res) => {
//     res.send('Signed up successfully');
// });

router.get('/profile/:query', getUserProfile);
router.post('/signup', signupUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/follow/:id', protectRoute, followUnfollowUser); //Toggle state(follow/unfollow)
router.put('/update/:id', protectRoute, updateUser);
router.get('/followers/:id', getFollowers);
router.get('/following/:id', getFollowing);

export default router;