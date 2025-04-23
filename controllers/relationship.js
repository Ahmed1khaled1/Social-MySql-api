import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const getRelationships = async (req, res) => {
  try {
    const user = await User.findById(req.query.followedUserId).select('followers');
    if (!user) return res.status(404).json("User not found!");
    
    return res.status(200).json(user.followers);
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const addRelationship = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  try {
    const userInfo = jwt.verify(token, "secretkey");
    
    // Update the followed user's followers
    const followedUser = await User.findById(req.body.userId);
    if (!followedUser) return res.status(404).json("User not found!");

    // Update the follower user's followings
    const followerUser = await User.findById(userInfo.id);
    if (!followerUser) return res.status(404).json("User not found!");

    // Check if already following
    if (followedUser.followers.includes(userInfo.id)) {
      return res.status(400).json("You are already following this user!");
    }

    // Add to followers and followings
    followedUser.followers.push(userInfo.id);
    followerUser.followings.push(req.body.userId);

    await followedUser.save();
    await followerUser.save();

    return res.status(200).json("Following");
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const deleteRelationship = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  try {
    const userInfo = jwt.verify(token, "secretkey");
    
    // Update the followed user's followers
    const followedUser = await User.findById(req.query.userId);
    if (!followedUser) return res.status(404).json("User not found!");

    // Update the follower user's followings
    const followerUser = await User.findById(userInfo.id);
    if (!followerUser) return res.status(404).json("User not found!");

    // Check if not following
    if (!followedUser.followers.includes(userInfo.id)) {
      return res.status(400).json("You are not following this user!");
    }

    // Remove from followers and followings
    followedUser.followers = followedUser.followers.filter(id => id.toString() !== userInfo.id);
    followerUser.followings = followerUser.followings.filter(id => id.toString() !== req.query.userId);

    await followedUser.save();
    await followerUser.save();

    return res.status(200).json("Unfollow");
  } catch (err) {
    return res.status(500).json(err);
  }
};