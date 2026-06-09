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
        <div className="min-h-screen bg-[#F4F7FB] bg-wave p-6 flex flex-col items-center relative">
            <div className="w-full max-w-2xl mt-12 z-10">
                <Card className="glass-card shadow-xl border-0">
                    <CardHeader className="text-center space-y-2">
                        <CardTitle className="text-3xl font-bold text-slate-900">Health Boot Booth</CardTitle>
                        <CardDescription className="text-slate-700 text-lg font-light">
                            Enter your full biometric data profile
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Gender */}
                                <div className="space-y-2">
                                    <Label className="text-slate-900 font-semibold">Gender</Label>
                                    <select 
                                        required 
                                        value={biometrics.gender}
                                        onChange={(e) => setBiometrics({...biometrics, gender: e.target.value})}
                                        className="flex h-10 w-full rounded-md border border-input bg-slate-50/50 border-slate-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                                {/* Weight */}
                                <div className="space-y-2">
                                    <Label className="text-slate-900 font-semibold">Body Weight (kg)</Label>
                                    <Input 
                                        type="number" 
                                        required 
                                        value={biometrics.weight}
                                        onChange={(e) => setBiometrics({...biometrics, weight: e.target.value})}
                                        placeholder="e.g. 70"
                                        className="bg-slate-50/50 border-slate-300"
                                    />
                                </div>
                                {/* Heart Rate */}
                                <div className="space-y-2">
                                    <Label className="text-slate-900 font-semibold">Heart Rate (bpm)</Label>
                                    <Input 
                                        type="number" 
                                        required 
                                        value={biometrics.heartRate}
                                        onChange={(e) => setBiometrics({...biometrics, heartRate: e.target.value})}
                                        placeholder="e.g. 75"
                                        className="bg-slate-50/50 border-slate-300"
                                    />
                                </div>
                                {/* Blood Pressure */}
                                <div className="space-y-2">
                                    <Label className="text-slate-900 font-semibold">Blood Pressure (Sys/Dia)</Label>
                                    <div className="flex gap-2">
                                        <Input 
                                            type="number" 
                                            required 
                                            value={biometrics.systolicBP}
                                            onChange={(e) => setBiometrics({...biometrics, systolicBP: e.target.value})}
                                            placeholder="Sys"
                                            className="bg-slate-50/50 border-slate-300"
                                        />
                                        <Input 
                                            type="number" 
                                            required 
                                            value={biometrics.diastolicBP}
                                            onChange={(e) => setBiometrics({...biometrics, diastolicBP: e.target.value})}
                                            placeholder="Dia"
                                            className="bg-slate-50/50 border-slate-300"
                                        />
                                    </div>
                                </div>
                                {/* Water */}
                                <div className="space-y-2">
                                    <Label className="text-slate-900 font-semibold">Water (%)</Label>
                                    <Input 
                                        type="number" 
                                        required 
                                        value={biometrics.water}
                                        onChange={(e) => setBiometrics({...biometrics, water: e.target.value})}
                                        placeholder="e.g. 55"
                                        className="bg-slate-50/50 border-slate-300"
                                    />
                                </div>
                                {/* Body Fat */}
                                <div className="space-y-2">
                                    <Label className="text-slate-900 font-semibold">Body Fat (%)</Label>
                                    <Input 
                                        type="number" 
                                        required 
                                        value={biometrics.bodyFat}
                                        onChange={(e) => setBiometrics({...biometrics, bodyFat: e.target.value})}
                                        placeholder="e.g. 15"
                                        className="bg-slate-50/50 border-slate-300"
                                    />
                                </div>
                                {/* Muscle */}
                                <div className="space-y-2">
                                    <Label className="text-slate-900 font-semibold">Muscle (%)</Label>
                                    <Input 
                                        type="number" 
                                        required 
                                        value={biometrics.muscle}
                                        onChange={(e) => setBiometrics({...biometrics, muscle: e.target.value})}
                                        placeholder="e.g. 40"
                                        className="bg-slate-50/50 border-slate-300"
                                    />
                                </div>
                                {/* Visceral Fat */}
                                <div className="space-y-2">
                                    <Label className="text-slate-900 font-semibold">Visceral Fat Level</Label>
                                    <Input 
                                        type="number" 
                                        required 
                                        value={biometrics.visceralFat}
                                        onChange={(e) => setBiometrics({...biometrics, visceralFat: e.target.value})}
                                        placeholder="e.g. 5"
                                        className="bg-slate-50/50 border-slate-300"
                                    />
                                </div>
                                {/* Bone Mass */}
                                <div className="space-y-2">
                                    <Label className="text-slate-900 font-semibold">Bone Mass (kg)</Label>
                                    <Input 
                                        type="number" 
                                        required 
                                        value={biometrics.boneMass}
                                        onChange={(e) => setBiometrics({...biometrics, boneMass: e.target.value})}
                                        placeholder="e.g. 3.5"
                                        className="bg-slate-50/50 border-slate-300"
                                    />
                                </div>
                            </div>
                            
                            <Button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full bg-slate-900 hover:bg-cyan-600 hover:shadow-cyan-glow text-white py-6 text-lg mt-8 flex items-center justify-center space-x-3 transition-all duration-300 transform active:scale-95 cursor-pointer"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin h-6 w-6 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span className="text-cyan-400 font-semibold drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">Analyzing Biometrics...</span>
                                    </>
                                ) : (
                                    <span>Submit Biometric Data</span>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
