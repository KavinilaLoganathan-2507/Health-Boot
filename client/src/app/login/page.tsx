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

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        phoneNo: "",
        password: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const response = await fetch(`${SERVER_URL}/api/user/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    phoneNo: formData.phoneNo,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                console.log("Login successful:", data);

                // Store token in localStorage
                if (data.data?.token) {
                    localStorage.setItem("authToken", data.data.token);
                    localStorage.setItem("userName", data.data.fullName);
                    localStorage.setItem("userData", JSON.stringify(data.data));

                    // Direct cookie setting as fallback
                    document.cookie = `authToken=${data.data.token}; max-age=${
                        60 * 60 * 24 * 7
                    }; path=/`;
                    document.cookie = `userName=${
                        data.data.fullName
                    }; max-age=${60 * 60 * 24 * 7}; path=/`;
                }

                // Log to verify cookie setting
                console.log("Cookies after setting:", {
                    authTokenCookie:
                        document.cookie.match(/authToken=([^;]*)/)?.[1],
                    userNameCookie:
                        document.cookie.match(/userName=([^;]*)/)?.[1],
                });

                // Navigate to the scan page (or wherever you want to redirect after login)
                setTimeout(() => {
                    router.push("/scan");
                }, 1000);
            } else {
                setError(data.message || "Login failed. Please try again.");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError(
                "Network error. Please check your connection and try again."
            );
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
                            <CardTitle className="text-2xl flex font-bold bg-[#000] bg-clip-text text-transparent">
                                Welcome Back
                            </CardTitle>
                            <CardDescription className="text-gray-600 mt-2">
                                Sign in to your account to continue
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
                                            value={formData.phoneNo}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    phoneNo: e.target.value,
                                                })
                                            }
                                            className="pl-10 bg-[#FFFDF7] text-black placeholder:text-gray-500"
                                            placeholder="Enter your phone number"
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
                                            value={formData.password}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    password: e.target.value,
                                                })
                                            }
                                            className="pl-10 bg-[#FFFDF7] text-black placeholder:text-gray-500"
                                            placeholder="Enter your password"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-[#004743] focus:ring-[#004743]"
                                    />
                                    <span className="text-gray-600">
                                        Remember me
                                    </span>
                                </label>
                                <a
                                    href="#"
                                    className="text-[#004743] hover:text-[#003331] font-medium"
                                >
                                    Forgot password?
                                </a>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#004743] text-white font-medium py-3 transition-all duration-300 transform hover:scale-[1.02] mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Signing In..." : "Sign In"}
                                {!isLoading && (
                                    <ChevronRight className="w-5 h-5 ml-2" />
                                )}
                            </Button>

                            <div className="text-center mt-6">
                                <p className="text-gray-600">
                                    Don&apos;t have an account?{" "}
                                    <a
                                        href="/onboarding/carousel"
                                        className="text-[#004743] hover:text-[#003331] font-medium"
                                    >
                                        Sign up here
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
