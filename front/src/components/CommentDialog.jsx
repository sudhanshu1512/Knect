import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedPost, updatePostComments } from "@/redux/postSlice";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { toast } from "sonner";
import moment from 'moment';
import { Trash2 } from 'lucide-react';

const CommentDialog = ({ open, setOpen }) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const { selectedPost } = useSelector((store) => store.post);
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      setLoading(true);
      const { data } = await api.post(`/post/${selectedPost._id}/comment`, { text });
      
      if (data.success) {
        setText("");
        // Update both posts array and selected post in Redux
        dispatch(updatePostComments({
          postId: selectedPost._id,
          comment: data.comment
        }));
        toast.success(data.message);
      } else {
        toast.error(data.message || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error(error?.response?.data?.message || 'Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const { data } = await api.delete(`/post/${selectedPost._id}/comment/${commentId}`);
      
      if (data.success) {
        // Update Redux state to remove the deleted comment
        const updatedComments = selectedPost.comments.filter(comment => comment._id !== commentId);
        dispatch(updatePostComments({
          postId: selectedPost._id,
          comments: updatedComments
        }));
        toast.success('Comment deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    const momentDate = moment(date);
    if (!momentDate.isValid()) return '';
    return momentDate.fromNow();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-[95%] sm:w-[90%] max-w-3xl h-[90vh] sm:h-[85vh] p-0 gap-0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 h-full">
          {/* Image Section */}
          <div className="block md:hidden h-[40vh] bg-black">
            <img
              src={selectedPost?.image}
              alt="post"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="hidden md:block bg-black h-full">
            <img
              src={selectedPost?.image}
              alt="post"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Comments Section */}
          <div className="flex flex-col h-[calc(50vh-80px)] md:h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 p-3 border-b bg-white dark:bg-gray-800 flex-shrink-0">
              <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                <AvatarImage src={selectedPost?.author?.profilePicture} />
                <AvatarFallback>
                  {selectedPost?.author?.username?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span 
                  className="font-medium text-sm sm:text-base cursor-pointer hover:underline"
                  onClick={() => {
                    setOpen(false);
                    navigate(`/profile/${selectedPost?.author?._id}`);
                  }}
                >
                  {selectedPost?.author?.username}
                </span>
                <span className="text-xs text-gray-500">
                  {formatTime(selectedPost?.createdAt)}
                </span>
              </div>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-3 space-y-4">
                {/* Post Caption */}
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                    <AvatarImage src={selectedPost?.author?.profilePicture} />
                    <AvatarFallback>
                      {selectedPost?.author?.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="text-sm sm:text-base break-words">{selectedPost?.caption}</span>
                  </div>
                </div>

                {/* Comments */}
                {selectedPost?.comments?.map((comment) => (
                  <div key={comment._id} className="flex items-start gap-3 group">
                    <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                      <AvatarImage src={comment.author?.profilePicture} />
                      <AvatarFallback>
                        {comment.author?.username?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <div className="flex items-baseline gap-2">
                          <span 
                            className="font-medium text-sm sm:text-base cursor-pointer hover:underline"
                            onClick={() => {
                              setOpen(false);
                              navigate(`/profile/${comment.author?._id}`);
                            }}
                          >
                            {comment.author?.username}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            {formatTime(comment.createdAt)}
                          </span>
                        </div>
                        {(comment.author?._id === user?._id || selectedPost?.author?._id === user?._id) && (
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <span className="text-sm sm:text-base break-words">{comment.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comment Input */}
            <div className="bg-white dark:bg-gray-800 border-t flex-shrink-0">
              <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="flex-1 outline-none text-sm sm:text-base"
                />
                {text && (
                  <Button 
                    type="submit"
                    variant="ghost"
                    className="text-blue-500 font-medium text-sm sm:text-base"
                    disabled={loading}
                  >
                    {loading ? "Posting..." : "Post"}
                  </Button>
                )}
              </form>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;
