import { setAuthUser } from "@/redux/authSlice";
import api from '@/api/axios';
import { Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "./ui/select";
import { Textarea } from "./ui/textarea";

const EditProfile = () => {
  const imageRef = useRef();
  const { user } = useSelector((store) => store.auth);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState({
    profilePhoto: user?.profilePicture,
    bio: user?.bio || '',
    gender: user?.gender || ''
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fileChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) setInput({ ...input, profilePhoto: file });
  };

  const selectChangeHandler = (value) => {
    setInput({ ...input, gender: value });
  };

  const editProfileHandler = async () => {
    if (!input.bio.trim()) {
      toast.error('Bio is required');
      return;
    }

    if (!input.gender) {
      toast.error('Please select a gender');
      return;
    }

    const formData = new FormData();
    formData.append("bio", input.bio.trim());
    formData.append("gender", input.gender);
    if (input.profilePhoto && input.profilePhoto instanceof File) {
      formData.append("profilePhoto", input.profilePhoto);
    }

    try {
      setLoading(true);
      const { data } = await api.post("/user/profile/edit", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      if (data.success) {
        dispatch(setAuthUser(data.user));
        toast.success('Profile updated successfully');
        navigate(`/profile/${user._id}`);
      } else {
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error("Edit profile error:", error);
      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
      
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage
              src={
                input.profilePhoto instanceof File
                  ? URL.createObjectURL(input.profilePhoto)
                  : input.profilePhoto
              }
              alt={user?.username}
            />
            <AvatarFallback>{user?.username?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <div>
            <h2 className="font-medium">{user?.username}</h2>
            <Button
              variant="link"
              className="p-0 h-auto text-blue-500"
              onClick={() => imageRef.current?.click()}
            >
              Change profile photo
            </Button>
            <input
              type="file"
              hidden
              ref={imageRef}
              onChange={fileChangeHandler}
              accept="image/*"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Bio</label>
          <Textarea
            placeholder="Write something about yourself..."
            value={input.bio}
            onChange={(e) => setInput({ ...input, bio: e.target.value })}
            className="resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Gender</label>
          <Select value={input.gender} onValueChange={selectChangeHandler}>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(`/profile/${user._id}`)}
          >
            Cancel
          </Button>
          <Button
            onClick={editProfileHandler}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
