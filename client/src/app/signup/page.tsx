"use client";

import { useState } from 'react';

import {
  ChevronRight,
  Lock,
  Phone,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SERVER_URL } from '@/lib/constants';

export default function SignupPage() {
    const router = useRouter();
    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const redirectUrl = searchParams?.get('redirect') || '/scan';

    const [formData, setFormData] = useState({
        fullName: "",
        phoneNo: "",
        password: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        if (formData.phoneNo.length !== 10) {
            setError("Phone number must be exactly 10 digits.");
            setIsLoading(false);
            return;
        }
        
        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${SERVER_URL}/api/user/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    phoneNo: formData.phoneNo,
                    password: formData.password
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                console.log("Registration successful:", data);

                // Assuming the backend returns the token on registration, otherwise route to login
                if (data.data?.token) {
                    localStorage.setItem("authToken", data.data.token);
                    localStorage.setItem("userName", data.data.fullName);
                    localStorage.setItem("userData", JSON.stringify(data.data));

                    document.cookie = `authToken=${data.data.token}; max-age=${60 * 60 * 24 * 7}; path=/`;
                    document.cookie = `userName=${data.data.fullName}; max-age=${60 * 60 * 24 * 7}; path=/`;

                    setTimeout(() => {
                        router.push(redirectUrl);
                    }, 1000);
                } else {
                    router.push('/login');
                }
            } else {
                const errorMessage = data.error?.message || data.message || "Registration failed. Please try again.";
                setError(errorMessage);
            }
        } catch (err) {
            console.error("Signup error:", err);
            setError("Network error. Please check your connection and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F0EDE4] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Card className="bg-[#F0EDE4]">
                    <CardHeader className="text-center space-y-4">
                        <div>
                            <CardTitle className="text-2xl flex justify-center font-bold bg-[#000] bg-clip-text text-transparent">
                                Create an Account
                            </CardTitle>
                            <CardDescription className="text-gray-600 mt-2">
                                Sign up to get started with NutriScan
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-6">
                                <div>
                                    <Label
                                        htmlFor="fullName"
                                        className="text-black font-medium"
                                    >
                                        Full Name *
                                    </Label>
                                    <div className="relative mt-2">
                                        <Input
                                            id="fullName"
                                            type="text"
                                            required
                                            value={formData.fullName}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    fullName: e.target.value,
                                                })
                                            }
                                            className="pl-4 bg-[#FFFDF7] text-black placeholder:text-gray-500"
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label
                                        htmlFor="phoneNo"
                                        className="text-black font-medium"
                                    >
                                        Phone Number *
                                    </Label>
                                    <div className="relative mt-2">
                                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <Input
                                            id="phoneNo"
                                            type="tel"
                                            required
                                            minLength={10}
                                            maxLength={10}
                                            value={formData.phoneNo}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    phoneNo: e.target.value.replace(/\D/g, ''),
                                                })
                                            }
                                            className="pl-10 bg-[#FFFDF7] text-black placeholder:text-gray-500"
                                            placeholder="Enter your 10-digit phone number"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label
                                        htmlFor="password"
                                        className="text-black font-medium"
                                    >
                                        Password *
                                    </Label>
                                    <div className="relative mt-2">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <Input
                                            id="password"
                                            type="password"
                                            required
                                            minLength={6}
                                            value={formData.password}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    password: e.target.value,
                                                })
                                            }
                                            className="pl-10 bg-[#FFFDF7] text-black placeholder:text-gray-500"
                                            placeholder="Create a password (min 6 characters)"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#004743] text-white font-medium py-3 transition-all duration-300 transform hover:scale-[1.02] mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Creating Account..." : "Sign Up"}
                                {!isLoading && (
                                    <ChevronRight className="w-5 h-5 ml-2" />
                                )}
                            </Button>

                            <div className="text-center mt-6">
                                <p className="text-gray-600">
                                    Already have an account?{" "}
                                    <a
                                        href="/login"
                                        className="text-[#004743] hover:text-[#003331] font-medium"
                                    >
                                        Login here
                                    </a>
                                </p>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
