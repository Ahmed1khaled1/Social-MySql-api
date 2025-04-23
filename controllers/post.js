import Post from "../models/Post.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import moment from "moment";

export const getPosts = async (req, res) => {
  const userId = req.query.userId;
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  try {
    const userInfo = jwt.verify(token, "secretkey");

    let posts;
    if (userId !== "undefined") {
      // Get posts for a specific user
      posts = await Post.find({ userId })
        .sort({ createdAt: -1 })
        .populate('userId', 'name profilePicture');
    } else {
      // Get posts from followed users and user's own posts
      const user = await User.findById(userInfo.id);
      const followingIds = user.followings;
      posts = await Post.find({
        $or: [
          { userId: { $in: followingIds } },
          { userId: userInfo.id }
        ]
      })
      .sort({ createdAt: -1 })
      .populate('userId', 'name profilePicture');
    }

    return res.status(200).json(posts);
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const addPost = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  try {
    const userInfo = jwt.verify(token, "secretkey");

    const newPost = new Post({
      desc: req.body.desc,
      img: req.body.img,
      userId: userInfo.id,
    });

    const savedPost = await newPost.save();
    return res.status(200).json("Post has been created.");
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const deletePost = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  try {
    const userInfo = jwt.verify(token, "secretkey");

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json("Post not found!");

    if (post.userId.toString() !== userInfo.id) {
      return res.status(403).json("You can delete only your post");
    }

    await Post.findByIdAndDelete(req.params.id);
    return res.status(200).json("Post has been deleted.");
  } catch (err) {
    return res.status(500).json(err);
  }
};
