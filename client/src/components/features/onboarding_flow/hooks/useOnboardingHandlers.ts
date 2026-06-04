"use client";

import { useCallback } from 'react';

import { useRouter } from 'next/navigation';

import { SERVER_URL } from '@/lib/constants';

interface OnboardingHandlersProps {
    userDetails: {
        name: string;
        phone: string;
        password?: string;
    };
    setCurrentStep: (step: number) => void;
    account: { address: string; publicKey: string };
    connected: boolean;
    setIsCreatingUser: (creating: boolean) => void;
    setApiResponse: (response: {
        success: boolean;
        message?: string;
        error?: string;
    }) => void;
    setSelectedRole: (role: string) => void;
    businessDetails?: {
        name: string;
        location: string;
        type: string;
        scale: string;
        governmentId: string;
        description?: string;
    };
    setBusinessDetails?: React.Dispatch<
        React.SetStateAction<{
            name: string;
            location: string;
            type: string;
            scale: string;
            governmentId: string;
            description?: string;
        }>
    >;
    userPreferences?: {
        healthGoals: string[];
        dietaryPreferences: string[];
        allergies: string[];
    };
    setUserPreferences?: React.Dispatch<
        React.SetStateAction<{
            healthGoals: string[];
            dietaryPreferences: string[];
            allergies: string[];
        }>
    >;
}

export const useOnboardingHandlers = ({
    userDetails,
    setCurrentStep,
    account,
    connected,
    setIsCreatingUser,
    setApiResponse,
    setSelectedRole,
    businessDetails,
    setBusinessDetails,
    userPreferences,
    setUserPreferences,
}: OnboardingHandlersProps) => {
    const router = useRouter();

    const handleUserDetailsSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            if (userDetails.name && userDetails.phone) {
                setCurrentStep(2);
            }
        },
        [userDetails, setCurrentStep]
    );

    const handleWalletConnected = useCallback(async () => {
        if (connected && account) {
            try {
                setApiResponse({
                    success: true,
                    message: "Wallet connected successfully",
                });

                // Store wallet information temporarily for later use
                sessionStorage.setItem(
                    "tempWalletAddress",
                    account.address?.toString() || ""
                );
                sessionStorage.setItem(
                    "tempWalletPublicKey",
                    Array.isArray(account.publicKey)
                        ? account.publicKey.join(", ")
                        : account.publicKey?.toString() || ""
                );

                // Move to role selection
                setTimeout(() => {
                    setCurrentStep(3);
                }, 1000);
            } catch (error) {
                console.error("Error connecting wallet:", error);
                setApiResponse({
                    success: false,
                    error: "An error occurred while connecting your wallet",
                });
            } finally {
                setIsCreatingUser(false);
            }
        }
    }, [account, connected, setCurrentStep, setApiResponse, setIsCreatingUser]);

    const handleRoleSelection = useCallback(
        (roleId: string) => {
            setSelectedRole(roleId);

            if (roleId === "user") {
                // If user chooses standard user role, proceed to user preferences form (step 5)
                setCurrentStep(5);
            } else if (roleId === "business") {
                // If user selects "Apply for Business License", proceed to the business details form
                setCurrentStep(4);
            }
        },
        [setCurrentStep, setSelectedRole]
    );

    const handleBusinessDetailsSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();

            if (!businessDetails || !setBusinessDetails) return;

            try {
                setIsCreatingUser(true);

                // Validate required fields
                if (
                    !businessDetails.name ||
                    !businessDetails.location ||
                    !businessDetails.type ||
                    !businessDetails.scale ||
                    !businessDetails.governmentId
                ) {
                    setApiResponse({
                        success: false,
                        error: "Please fill out all required fields",
                    });
                    return;
                }

                // Get wallet details from session storage
                const petraWalletAddress =
                    sessionStorage.getItem("tempWalletAddress") || "";
                const petraPublicKey =
                    sessionStorage.getItem("tempWalletPublicKey") || "";

                // Create new user with business details
                const userData = {
                    fullName: userDetails.name,
                    phoneNo: userDetails.phone,
                    password: userDetails.password || "defaultPassword",
                    petraWalletAddress,
                    petraPublicKey,
                    healthStatus: "healthy", // Default value
                    role: "business",
                    businessDetails: {
                        name: businessDetails.name,
                        location: businessDetails.location,
                        type: businessDetails.type,
                        scale: businessDetails.scale,
                        governmentId: businessDetails.governmentId,
                        description: businessDetails.description || "",
                    },
                };

                // Call API to create user
                const response = await fetch(`${SERVER_URL}/api/user/create`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(userData),
                });

                const data = await response.json();

                if (data.success) {
                    if (data.data?.token) {
                        // Store token in localStorage

                        // Set direct cookies as fallback
                        document.cookie = `authToken=${
                            data.data.token
                        }; max-age=${60 * 60 * 24 * 7}; path=/`;
                        document.cookie = `userName=${
                            userDetails.name
                        }; max-age=${60 * 60 * 24 * 7}; path=/`;
                    }

                    // Show success message
                    setApiResponse({
                        success: true,
                        message:
                            "Business license application submitted successfully",
                    });

                    // Store business details in cookies

                    // Navigate to dashboard with pending status
                    setTimeout(() => {
                        router.push("/dashboard?status=pending");
                    }, 2000);
                } else {
                    setApiResponse({
                        success: false,
                        error:
                            data.message ||
                            "Failed to submit business application",
                    });
                }
            } catch (error) {
                console.error("Error submitting business details:", error);
                setApiResponse({
                    success: false,
                    error: "An error occurred while submitting your application",
                });
            } finally {
                setIsCreatingUser(false);
            }
        },
        [
            businessDetails,
            router,
            setApiResponse,
            setBusinessDetails,
            setIsCreatingUser,
            userDetails,
        ]
    );

    const handleUserPreferencesSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();

            if (!userPreferences || !setUserPreferences) return;

            try {
                setIsCreatingUser(true);

                // Get wallet details from session storage
                const petraWalletAddress =
                    sessionStorage.getItem("tempWalletAddress") || "";
                const petraPublicKey =
                    sessionStorage.getItem("tempWalletPublicKey") || "";

                // Prepare user data with preferences for API
                const userData = {
                    fullName: userDetails.name,
                    phoneNo: userDetails.phone,
                    password: userDetails.password || "defaultPassword",
                    petraWalletAddress,
                    petraPublicKey,
                    healthStatus: "healthy", // Default value
                    role: "user",
                    healthGoals: userPreferences.healthGoals,
                    dietaryPreferences: userPreferences.dietaryPreferences,
                    nutritionPriorities: userPreferences.allergies, // Map allergies to nutritionPriorities for the API
                };

                // Call API to create user with preferences
                const response = await fetch(`${SERVER_URL}/api/user/create`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(userData),
                });

                const data = await response.json();

                if (data.success) {
                    // Store token in localStorage
                    if (data.data?.token) {
                        localStorage.setItem("authToken", data.data.token);

                        // Store preferences locally for client-side use
                        localStorage.setItem(
                            "user-preferences",
                            JSON.stringify(userPreferences)
                        );

                        // Direct cookie setting as fallback
                        document.cookie = `authToken=${
                            data.data.token
                        }; max-age=${60 * 60 * 24 * 7}; path=/`;
                        document.cookie = `userName=${
                            userDetails.name
                        }; max-age=${60 * 60 * 24 * 7}; path=/`;
                    }

                    // Show success message
                    setApiResponse({
                        success: true,
                        message: "Preferences saved successfully!",
                    });

                    // Log to verify cookie setting
                    console.log("Cookies after setting:", {
                        authTokenCookie:
                            document.cookie.match(/auth-token=([^;]*)/)?.[1],
                        userNameCookie:
                            document.cookie.match(/user-name=([^;]*)/)?.[1],
                    });

                    // Navigate to the streaming page
                    setTimeout(() => {
                        router.push("/scan");
                    }, 1000);
                } else {
                    setApiResponse({
                        success: false,
                        error: data.message || "Failed to save preferences",
                    });
                }
            } catch (error) {
                console.error("Error saving preferences:", error);
                setApiResponse({
                    success: false,
                    error: "An error occurred while saving your preferences",
                });

                // Fallback: Save to localStorage and proceed anyway
                localStorage.setItem(
                    "user-preferences",
                    JSON.stringify(userPreferences)
                );

                setTimeout(() => {
                    router.push("/streaming");
                }, 1000);
            } finally {
                setIsCreatingUser(false);
            }
        },
        [
            router,
            userPreferences,
            setApiResponse,
            setUserPreferences,
            setIsCreatingUser,
            userDetails,
        ]
    );

    return {
        handleUserDetailsSubmit,
        handleWalletConnected,
        handleRoleSelection,
        handleBusinessDetailsSubmit,
        handleUserPreferencesSubmit,
    };
};
