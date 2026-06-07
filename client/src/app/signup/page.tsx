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
import styles from './signup.module.css';

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
        <div className={styles.signupContainer}>
            <div className={styles.signupWrapper}>
                <Card className={styles.signupCard}>
                    <CardHeader className={styles.headerContainer}>
                        <div>
                            <CardTitle className={`${styles.titleContainer} ${styles.titleText}`}>
                                Create an Account
                            </CardTitle>
                            <CardDescription className={styles.descriptionText}>
                                Sign up to get started with Health Boot
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
                                <div className={styles.formGroup}>
                                    <Label
                                        htmlFor="fullName"
                                        className={styles.inputLabel}
                                    >
                                        Full Name *
                                    </Label>
                                    <div className={styles.inputWrapper}>
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
                                            className={styles.inputFieldNoIcon}
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
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
                                            minLength={10}
                                            maxLength={10}
                                            value={formData.phoneNo}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    phoneNo: e.target.value.replace(/\D/g, ''),
                                                })
                                            }
                                            className={styles.inputField}
                                            placeholder="Enter your 10-digit phone number"
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
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
                                            minLength={6}
                                            value={formData.password}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    password: e.target.value,
                                                })
                                            }
                                            className={styles.inputField}
                                            placeholder="Create a password (min 6 characters)"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className={styles.submitButton}
                            >
                                {isLoading ? "Creating Account..." : "Sign Up"}
                                {!isLoading && (
                                    <ChevronRight className={styles.buttonIcon} />
                                )}
                            </Button>

                            <div className={styles.footerContainer}>
                                <p className={styles.footerText}>
                                    Already have an account?{" "}
                                    <a
                                        href="/login"
                                        className={styles.loginLink}
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
