import { useEffect, useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import axios from 'axios';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import image from "../assets/image.png";

const Signup = () => {
    const [input, setInput] = useState({
        username: "",
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const {user} = useSelector(store=>store.auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate("/");
        }
    }, [user, navigate]);

    const validatePassword = (password) => {
        const minLength = 6;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (password.length < minLength) {
            return "Password must be at least 6 characters long";
        }
        if (!hasUpperCase) {
            return "Password must contain at least one uppercase letter";
        }
        if (!hasNumber) {
            return "Password must contain at least one number";
        }
        if (!hasSpecial) {
            return "Password must contain at least one special character";
        }
        return "";
    };

    const changeEventHandler = (e) => {
        const { name, value } = e.target;
        setInput({ ...input, [name]: value });
        
        if (name === 'password') {
            setPasswordError(validatePassword(value));
        }
    };

    const signupHandler = async (e) => {
        e.preventDefault();

        const passwordValidation = validatePassword(input.password);
        if (passwordValidation) {
            toast.error(passwordValidation);
            return;
        }

        try {
            setLoading(true);
            const res = await axios.post(
              "https://knect.onrender.com/api/v1/user/register",
              input,
              {
                headers: {
                  "Content-Type": "application/json"
                },
                withCredentials: true
              }
            );
            if (res.data.success) {
                navigate("/login");
                toast.success(res.data.message);
                setInput({
                    username: "",
                    email: "",
                    password: ""
                });
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='flex items-center w-screen h-screen justify-center'>
            <form onSubmit={signupHandler} className='shadow-lg flex flex-col gap-5 p-8'>
                <div className='my-4 text-center'>
                    <h1 className='font-bold text-xl'>KNECT</h1>
                    <div className="flex justify-center">
                        <img src={image} alt="knect" style={{ maxHeight: '100px', width: 'auto' }} />
                    </div>
                    <p className='text-sm text-center'>Signup to see photos & videos from your friends</p>
                </div>
                <div>
                    <span className='font-medium'>Username</span>
                    <Input
                        type="text"
                        name="username"
                        value={input.username}
                        onChange={changeEventHandler}
                        className="focus-visible:ring-transparent my-2"
                        required
                    />
                </div>
                <div>
                    <span className='font-medium'>Email</span>
                    <Input
                        type="email"
                        name="email"
                        value={input.email}
                        onChange={changeEventHandler}
                        className="focus-visible:ring-transparent my-2"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <span className='font-medium'>Password</span>
                    <Input
                        type="password"
                        name="password"
                        placeholder="Enter your password"
                        value={input.password}
                        onChange={changeEventHandler}
                        required
                        className="focus-visible:ring-transparent my-2"
                        pattern="(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?:{}|<>])[A-Za-z0-9!@#$%^&*(),.?:{}|<>]{6,}"
                        title="Password must contain at least 6 characters, including uppercase, number, and special character"
                    />
                    {passwordError && (
                        <p className="text-sm text-red-500">{passwordError}</p>
                    )}
                </div>
                {
                    loading ? (
                        <Button>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Please wait
                        </Button>
                    ) : (
                        <Button type='submit'>Signup</Button>
                    )
                }
                <span className='text-center'>Already have an account? <Link to="/login" className='text-blue-600'>Login</Link></span>
            </form>
        </div>
    )
}

export default Signup