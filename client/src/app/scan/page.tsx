"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ScanPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    
    // Mock Biometric Data State
    const [biometrics, setBiometrics] = useState({
        gender: "Male",
        weight: "",
        heartRate: "",
        systolicBP: "",
        diastolicBP: "",
        water: "",
        bodyFat: "",
        muscle: "",
        visceralFat: "",
        boneMass: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            const token = localStorage.getItem("authToken");
            const response = await fetch(`/api/user/biometrics/analyze`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(biometrics)
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                // Save analysis result to local storage for the dashboard
                localStorage.setItem('latestBiometricAnalysis', JSON.stringify(data.data));
                router.push('/dashboard');
            } else {
                alert("Failed to analyze biometrics: " + (data.error?.message || "Unknown error"));
            }
        } catch (err) {
            alert("Network error while analyzing biometrics.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F0EDE4] p-6 flex flex-col items-center">
            <div className="w-full max-w-2xl mt-12">
                <Card className="bg-white shadow-xl">
                    <CardHeader className="text-center space-y-2">
                        <CardTitle className="text-3xl font-bold text-[#004743]">Health Boot Booth</CardTitle>
                        <CardDescription className="text-gray-600 text-lg">
                            Enter your full biometric data profile
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Gender */}
                                <div className="space-y-2">
                                    <Label className="text-gray-800 font-semibold">Gender</Label>
                                    <select 
                                        required 
                                        value={biometrics.gender}
                                        onChange={(e) => setBiometrics({...biometrics, gender: e.target.value})}
                                        className="flex h-10 w-full rounded-md border border-input bg-[#F5F3F0] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                                {/* Weight */}
                                <div className="space-y-2">
                                    <Label className="text-gray-800 font-semibold">Body Weight (kg)</Label>
                                    <Input 
                                        type="number" 
                                        required 
                                        value={biometrics.weight}
                                        onChange={(e) => setBiometrics({...biometrics, weight: e.target.value})}
                                        placeholder="e.g. 70"
                                        className="bg-[#F5F3F0]"
                                    />
                                </div>
                                {/* Heart Rate */}
                                <div className="space-y-2">
                                    <Label className="text-gray-800 font-semibold">Heart Rate (bpm)</Label>
                                    <Input 
                                        type="number" 
                                        required 
                                        value={biometrics.heartRate}
                                        onChange={(e) => setBiometrics({...biometrics, heartRate: e.target.value})}
                                        placeholder="e.g. 75"
                                        className="bg-[#F5F3F0]"
                                    />
                                </div>
                                {/* Blood Pressure */}
                                <div className="space-y-2">
                                    <Label className="text-gray-800 font-semibold">Blood Pressure (Sys/Dia)</Label>
                                    <div className="flex gap-2">
                                        <Input 
                                            type="number" 
                                            required 
                                            value={biometrics.systolicBP}
                                            onChange={(e) => setBiometrics({...biometrics, systolicBP: e.target.value})}
                                            placeholder="Sys"
                                            className="bg-[#F5F3F0]"
                                        />
                                        <Input 
                                            type="number" 
                                            required 
                                            value={biometrics.diastolicBP}
                                            onChange={(e) => setBiometrics({...biometrics, diastolicBP: e.target.value})}
                                            placeholder="Dia"
                                            className="bg-[#F5F3F0]"
                                        />
                                    </div>
                                </div>
                                {/* Water */}
                                <div className="space-y-2">
                                    <Label className="text-gray-800 font-semibold">Water (%)</Label>
                                    <Input 
                                        type="number" 
                                        required 
                                        value={biometrics.water}
                                        onChange={(e) => setBiometrics({...biometrics, water: e.target.value})}
                                        placeholder="e.g. 55"
                                        className="bg-[#F5F3F0]"
                                    />
                                </div>
                                {/* Body Fat */}
                                <div className="space-y-2">
                                    <Label className="text-gray-800 font-semibold">Body Fat (%)</Label>
                                    <Input 
                                        type="number" 
                                        required 
                                        value={biometrics.bodyFat}
                                        onChange={(e) => setBiometrics({...biometrics, bodyFat: e.target.value})}
                                        placeholder="e.g. 15"
                                        className="bg-[#F5F3F0]"
                                    />
                                </div>
                                {/* Muscle */}
                                <div className="space-y-2">
                                    <Label className="text-gray-800 font-semibold">Muscle (%)</Label>
                                    <Input 
                                        type="number" 
                                        required 
                                        value={biometrics.muscle}
                                        onChange={(e) => setBiometrics({...biometrics, muscle: e.target.value})}
                                        placeholder="e.g. 40"
                                        className="bg-[#F5F3F0]"
                                    />
                                </div>
                                {/* Visceral Fat */}
                                <div className="space-y-2">
                                    <Label className="text-gray-800 font-semibold">Visceral Fat Level</Label>
                                    <Input 
                                        type="number" 
                                        required 
                                        value={biometrics.visceralFat}
                                        onChange={(e) => setBiometrics({...biometrics, visceralFat: e.target.value})}
                                        placeholder="e.g. 5"
                                        className="bg-[#F5F3F0]"
                                    />
                                </div>
                                {/* Bone Mass */}
                                <div className="space-y-2">
                                    <Label className="text-gray-800 font-semibold">Bone Mass (kg)</Label>
                                    <Input 
                                        type="number" 
                                        required 
                                        value={biometrics.boneMass}
                                        onChange={(e) => setBiometrics({...biometrics, boneMass: e.target.value})}
                                        placeholder="e.g. 3.5"
                                        className="bg-[#F5F3F0]"
                                    />
                                </div>
                            </div>
                            
                            <Button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full bg-[#004743] hover:bg-[#003a37] text-white py-6 text-lg mt-8"
                            >
                                {isLoading ? "Processing Data..." : "Submit Biometric Data"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
