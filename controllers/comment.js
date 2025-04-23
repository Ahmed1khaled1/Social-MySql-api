import Post from "../models/Post.js";
import jwt from "jsonwebtoken";

export const getComments = async (req, res) => {
  try {
    const post = await Post.findById(req.query.postId)
      .populate('comments.userId', 'name profilePicture')
      .select('comments');
    
    if (!post) return res.status(404).json("Post not found!");
    
    return res.status(200).json(post.comments);
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const addComment = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  try {
    const userInfo = jwt.verify(token, "secretkey");
    
    const post = await Post.findById(req.body.postId);
    if (!post) return res.status(404).json("Post not found!");

    const newComment = {
      userId: userInfo.id,
      text: req.body.desc,
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    // Populate the user info in the response
    const updatedPost = await Post.findById(req.body.postId)
      .populate('comments.userId', 'name profilePicture')
      .select('comments');
    
    return res.status(200).json(updatedPost.comments[updatedPost.comments.length - 1]);
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const deleteComment = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not authenticated!");

  try {
    const userInfo = jwt.verify(token, "secretkey");
    
    const post = await Post.findOne({ "comments._id": req.params.id });
    if (!post) return res.status(404).json("Comment not found!");

    const comment = post.comments.id(req.params.id);
    if (!comment) return res.status(404).json("Comment not found!");

    if (comment.userId.toString() !== userInfo.id) {
      return res.status(403).json("You can delete only your comment!");
    }

    comment.remove();
    await post.save();

    return res.status(200).json("Comment has been deleted!");
  } catch (err) {
    return res.status(500).json(err);
  }
};
