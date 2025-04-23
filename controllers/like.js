import Post from "../models/Post.js";
import jwt from "jsonwebtoken";

export const getLikes = async (req, res) => {
  try {
    const post = await Post.findById(req.query.postId).select('likes');
    if (!post) return res.status(404).json("Post not found!");
    
    return res.status(200).json(post.likes);
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const addLike = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  try {
    const userInfo = jwt.verify(token, "secretkey");
    
    const post = await Post.findById(req.body.postId);
    if (!post) return res.status(404).json("Post not found!");

    // Check if user already liked the post
    if (post.likes.includes(userInfo.id)) {
      return res.status(400).json("You already liked this post!");
    }

    post.likes.push(userInfo.id);
    await post.save();

    return res.status(200).json("Post has been liked.");
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const deleteLike = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  try {
    const userInfo = jwt.verify(token, "secretkey");
    
    const post = await Post.findById(req.query.postId);
    if (!post) return res.status(404).json("Post not found!");

    // Check if user has liked the post
    if (!post.likes.includes(userInfo.id)) {
      return res.status(400).json("You haven't liked this post!");
    }

    // Remove the like
    post.likes = post.likes.filter(id => id.toString() !== userInfo.id);
    await post.save();

    return res.status(200).json("Post has been disliked.");
  } catch (err) {
    return res.status(500).json(err);
  }
};