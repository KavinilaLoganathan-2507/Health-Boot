"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User as UserIcon, Phone, Activity, Settings, LogOut, Edit2, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SERVER_URL } from "@/lib/constants";

export default function ProfilePage() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const data = localStorage.getItem("userData");
    if (data) {
      const parsed = JSON.parse(data);
      setUserData(parsed);
      setFormData({
        fullName: parsed.fullName || "",
        age: parsed.age || "",
        height: parsed.height || "",
        weight: parsed.weight || "",
        workOutsPerWeek: parsed.workOutsPerWeek || "",
        healthStatus: parsed.healthStatus || "",
      });
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("userData");
    document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "userName=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login");
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${SERVER_URL}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        // Update local storage
        const updatedData = { ...userData, ...formData };
        setUserData(updatedData);
        localStorage.setItem("userData", JSON.stringify(updatedData));
        localStorage.setItem("userName", formData.fullName);
        document.cookie = `userName=${formData.fullName}; max-age=${60 * 60 * 24 * 7}; path=/`;
        setIsEditing(false);
      } else {
        setError(data.error?.message || data.message || "Failed to update profile.");
      }
    } catch (err) {
      setError("Network error while updating profile.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB] p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">My Profile</h1>
            <p className="text-slate-700 text-lg mt-2">Manage your personal information and preferences.</p>
          </div>
          <Button onClick={() => router.push("/dashboard")} variant="outline" className="border-slate-900 text-slate-900">
            Back to Dashboard
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center space-x-3">
              <div className="bg-slate-900 p-3 rounded-full">
                <UserIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">{isEditing ? "Edit Profile" : userData.fullName}</CardTitle>
                <CardDescription>Personal Details</CardDescription>
              </div>
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="flex items-center">
                <Edit2 className="w-4 h-4 mr-2" /> Edit
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isEditing && (
                <div className="col-span-1 md:col-span-2">
                  <p className="text-sm text-slate-500 mb-1">Full Name</p>
                  <Input 
                    value={formData.fullName} 
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    placeholder="Full Name"
                  />
                </div>
              )}

              <div className="flex items-center space-x-3 p-3 bg-slate-50 border-slate-300 rounded-lg">
                <Phone className="h-5 w-5 text-slate-500" />
                <div className="w-full">
                  <p className="text-sm text-slate-500">Phone Number</p>
                  <p className="font-medium text-slate-900">{userData.phoneNo || "Not provided"} <span className="text-xs text-blue-500 ml-2">(Cannot be changed)</span></p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-slate-50 border-slate-300 rounded-lg">
                <Activity className="h-5 w-5 text-slate-500" />
                <div className="w-full">
                  <p className="text-sm text-slate-500">Age</p>
                  {isEditing ? (
                    <Input 
                      value={formData.age} 
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                      placeholder="e.g. 25"
                      className="mt-1 h-8"
                    />
                  ) : (
                    <p className="font-medium text-slate-900">{userData.age || "Not provided"}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-slate-50 border-slate-300 rounded-lg">
                <Settings className="h-5 w-5 text-slate-500" />
                <div className="w-full">
                  <p className="text-sm text-slate-500">Height (cm)</p>
                  {isEditing ? (
                    <Input 
                      value={formData.height} 
                      onChange={(e) => setFormData({...formData, height: e.target.value})}
                      placeholder="e.g. 175"
                      className="mt-1 h-8"
                    />
                  ) : (
                    <p className="font-medium text-slate-900">{userData.height ? `${userData.height} cm` : "Not provided"}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-slate-50 border-slate-300 rounded-lg">
                <Activity className="h-5 w-5 text-slate-500" />
                <div className="w-full">
                  <p className="text-sm text-slate-500">Weight (kg)</p>
                  {isEditing ? (
                    <Input 
                      value={formData.weight} 
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                      placeholder="e.g. 70"
                      className="mt-1 h-8"
                    />
                  ) : (
                    <p className="font-medium text-slate-900">{userData.weight ? `${userData.weight} kg` : "Not provided"}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-slate-50 border-slate-300 rounded-lg">
                <Activity className="h-5 w-5 text-slate-500" />
                <div className="w-full">
                  <p className="text-sm text-slate-500">Workouts Per Week</p>
                  {isEditing ? (
                    <Input 
                      value={formData.workOutsPerWeek} 
                      onChange={(e) => setFormData({...formData, workOutsPerWeek: e.target.value})}
                      placeholder="e.g. 3-5"
                      className="mt-1 h-8"
                    />
                  ) : (
                    <p className="font-medium text-slate-900">{userData.workOutsPerWeek || "Not provided"}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-slate-50 border-slate-300 rounded-lg">
                <Activity className="h-5 w-5 text-slate-500" />
                <div className="w-full">
                  <p className="text-sm text-slate-500">Health Status</p>
                  {isEditing ? (
                    <Input 
                      value={formData.healthStatus} 
                      onChange={(e) => setFormData({...formData, healthStatus: e.target.value})}
                      placeholder="e.g. general_wellness"
                      className="mt-1 h-8"
                    />
                  ) : (
                    <p className="font-medium text-slate-900">{userData.healthStatus || "Not provided"}</p>
                  )}
                </div>
              </div>
            </div>

            {isEditing ? (
              <div className="pt-6 border-t border-slate-200 flex items-center space-x-4">
                <Button 
                  onClick={handleSave} 
                  disabled={isLoading}
                  className="flex items-center bg-slate-900 hover:bg-cyan-600 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
                <Button 
                  onClick={() => {
                    setIsEditing(false);
                    // Revert form data
                    setFormData({
                      fullName: userData.fullName || "",
                      age: userData.age || "",
                      height: userData.height || "",
                      weight: userData.weight || "",
                      workOutsPerWeek: userData.workOutsPerWeek || "",
                      healthStatus: userData.healthStatus || "",
                    });
                  }} 
                  variant="outline" 
                  className="flex items-center text-slate-700"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="pt-6 border-t border-slate-200">
                <Button 
                  onClick={handleLogout} 
                  variant="destructive" 
                  className="w-full md:w-auto flex items-center bg-red-600 hover:bg-red-700"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
