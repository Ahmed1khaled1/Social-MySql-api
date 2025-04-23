import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json("User not found!");
    
    const { password, ...info } = user._doc;
    return res.json(info);
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const updateUser = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not authenticated!");

  try {
    const userInfo = jwt.verify(token, "secretkey");
    
    const updatedUser = await User.findByIdAndUpdate(
      userInfo.id,
      {
        $set: {
          name: req.body.name,
          city: req.body.city,
          website: req.body.website,
          profilePicture: req.body.profilePic,
          coverPicture: req.body.coverPic,
        },
      },
      { new: true }
    );

    if (!updatedUser) return res.status(403).json("You can update only your profile!");
    
    const { password, ...info } = updatedUser._doc;
    return res.json(info);
  } catch (err) {
    return res.status(500).json(err);
  }
};
