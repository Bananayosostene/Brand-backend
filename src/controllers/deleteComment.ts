// Import necessary modules
import { Request, Response } from "express";
import { verifyingToken } from "../utils/token";
import CommentModel, { CommentDocument } from "../models/commentsModel";

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
  };
}

export const deleteComment = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    verifyingToken(req, res, async () => {
      const commentId = req.params.commentId; 
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({
          message: "User information not found in the token",
        });
      }

      const comment: CommentDocument | null = await CommentModel.findById(
        commentId
      );

      if (!comment) {
        return res.status(404).json({
          message: "Comment not found",
          data: null,
        });
      }

      if (comment.user._id.toString() !== userId) {
        return res.status(403).json({
          message: "You do not have permission to delete this comment",
          data: null,
        });
      }
        

      const deletedComment = await CommentModel.findByIdAndDelete(commentId);

      if (deletedComment) {
        return res.status(200).json({
          message: "Comment deleted successfully",
          data: deletedComment,
        });
      } else {
        return res.status(500).json({
          message: "Failed to delete comment",
          data: null,
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      data: null,
      theErrorIs: error,
    });
  }
};
