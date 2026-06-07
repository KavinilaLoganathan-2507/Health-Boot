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
import styles from './login.module.css';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const redirectUrl = searchParams?.get('redirect') || '/dashboard';

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

                // Navigate back to the redirect url or dashboard
                setTimeout(() => {
                    router.push(redirectUrl);
                }, 1000);
            } else {
                const errorMessage = data.error?.message || data.message || "Login failed. Please try again.";
                setError(errorMessage);
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
        <div className={styles.loginContainer}>
            <div className={styles.loginWrapper}>
                <Card className={styles.loginCard}>
                    <CardHeader className={styles.headerContainer}>
                        <div>
                            <CardTitle className={`${styles.titleContainer} ${styles.titleText}`}>
                                Welcome Back
                            </CardTitle>
                            <CardDescription className={styles.descriptionText}>
                                Sign in to your account to continue
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className={styles.formContainer}>
                            {error && (
                                <div className={styles.errorBox}>
                                    {error}
                                </div>
                            )}

                            <div className={styles.inputsContainer}>
                                <div className={styles.inputGroup}>
                                    <Label
                                        htmlFor="phoneNo"
                                        className={styles.inputLabel}
                                    >
                                        Phone Number *
                                    </Label>
                                    <div className={styles.inputWrapper}>
                                        <Phone className={styles.inputIcon} />
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
                                            className={styles.inputField}
                                            placeholder="Enter your phone number"
                                        />
                                    </div>
                                </div>

                                <div className={styles.inputGroup}>
                                    <Label
                                        htmlFor="password"
                                        className={styles.inputLabel}
                                    >
                                        Password *
                                    </Label>
                                    <div className={styles.inputWrapper}>
                                        <Lock className={styles.inputIcon} />
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
                                            className={styles.inputField}
                                            placeholder="Enter your password"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.optionsContainer}>
                                <label className={styles.rememberLabel}>
                                    <input
                                        type="checkbox"
                                        className={styles.checkboxInput}
                                    />
                                    <span className={styles.rememberText}>
                                        Remember me
                                    </span>
                                </label>
                                <a
                                    href="#"
                                    className={styles.forgotLink}
                                >
                                    Forgot password?
                                </a>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className={styles.submitButton}
                            >
                                {isLoading ? "Signing In..." : "Sign In"}
                                {!isLoading && (
                                    <ChevronRight className={styles.buttonIcon} />
                                )}
                            </Button>

                            <div className={styles.footerContainer}>
                                <p className={styles.footerText}>
                                    Don&apos;t have an account?{" "}
                                    <a
                                        href={`/signup?redirect=${encodeURIComponent(redirectUrl)}`}
                                        className={styles.signupLink}
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
