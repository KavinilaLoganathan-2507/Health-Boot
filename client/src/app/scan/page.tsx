"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import styles from './scan.module.css';

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
        <div className={styles.scanContainer}>
            <div className={styles.scanWrapper}>
                <Card className={styles.formCard}>
                    <CardHeader className={styles.headerContainer}>
                        <CardTitle className={styles.titleText}>Health Boot Booth</CardTitle>
                        <CardDescription className={styles.descriptionText}>
                            Enter your full biometric data profile
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className={styles.formContainer}>
                            <div className={styles.inputsGrid}>
                                {/* Gender */}
                                <div className={styles.inputGroup}>
                                    <Label className={styles.inputLabel}>Gender</Label>
                                    <select 
                                        required 
                                        value={biometrics.gender}
                                        onChange={(e) => setBiometrics({...biometrics, gender: e.target.value})}
                                        className={styles.metricInput}
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                                {/* Weight */}
                                <div className={styles.inputGroup}>
                                    <Label className={styles.inputLabel}>Body Weight (kg)</Label>
                                    <Input 
                                        type="number" 
                                        required 
                                        value={biometrics.weight}
                                        onChange={(e) => setBiometrics({...biometrics, weight: e.target.value})}
                                        placeholder="e.g. 70"
                                        className={styles.metricInput}
                                    />
                                </div>
                                {/* Heart Rate */}
                                <div className={styles.inputGroup}>
                                    <Label className={styles.inputLabel}>Heart Rate (bpm)</Label>
                                    <Input 
                                        type="number" 
                                        required 
                                        value={biometrics.heartRate}
                                        onChange={(e) => setBiometrics({...biometrics, heartRate: e.target.value})}
                                        placeholder="e.g. 75"
                                        className={styles.metricInput}
                                    />
                                </div>
                                {/* Blood Pressure */}
                                <div className={styles.inputGroup}>
                                    <Label className={styles.inputLabel}>Blood Pressure (Sys/Dia)</Label>
                                    <div className={styles.metricInputRow}>
                                        <Input 
                                            type="number" 
                                            required 
                                            value={biometrics.systolicBP}
                                            onChange={(e) => setBiometrics({...biometrics, systolicBP: e.target.value})}
                                            placeholder="Sys"
                                            className={styles.metricInput}
                                        />
                                        <Input 
                                            type="number" 
                                            required 
                                            value={biometrics.diastolicBP}
                                            onChange={(e) => setBiometrics({...biometrics, diastolicBP: e.target.value})}
                                            placeholder="Dia"
                                            className={styles.metricInput}
                                        />
                                    </div>
                                </div>
                                {/* Water */}
                                <div className={styles.inputGroup}>
                                    <Label className={styles.inputLabel}>Water (%)</Label>
                                    <Input 
                                        type="number" 
                                        required 
                                        value={biometrics.water}
                                        onChange={(e) => setBiometrics({...biometrics, water: e.target.value})}
                                        placeholder="e.g. 55"
                                        className={styles.metricInput}
                                    />
                                </div>
                                {/* Body Fat */}
                                <div className={styles.inputGroup}>
                                    <Label className={styles.inputLabel}>Body Fat (%)</Label>
                                    <Input 
                                        type="number" 
                                        required 
                                        value={biometrics.bodyFat}
                                        onChange={(e) => setBiometrics({...biometrics, bodyFat: e.target.value})}
                                        placeholder="e.g. 15"
                                        className={styles.metricInput}
                                    />
                                </div>
                                {/* Muscle */}
                                <div className={styles.inputGroup}>
                                    <Label className={styles.inputLabel}>Muscle (%)</Label>
                                    <Input 
                                        type="number" 
                                        required 
                                        value={biometrics.muscle}
                                        onChange={(e) => setBiometrics({...biometrics, muscle: e.target.value})}
                                        placeholder="e.g. 40"
                                        className={styles.metricInput}
                                    />
                                </div>
                                {/* Visceral Fat */}
                                <div className={styles.inputGroup}>
                                    <Label className={styles.inputLabel}>Visceral Fat Level</Label>
                                    <Input 
                                        type="number" 
                                        required 
                                        value={biometrics.visceralFat}
                                        onChange={(e) => setBiometrics({...biometrics, visceralFat: e.target.value})}
                                        placeholder="e.g. 5"
                                        className={styles.metricInput}
                                    />
                                </div>
                                {/* Bone Mass */}
                                <div className={styles.inputGroup}>
                                    <Label className={styles.inputLabel}>Bone Mass (kg)</Label>
                                    <Input 
                                        type="number" 
                                        required 
                                        value={biometrics.boneMass}
                                        onChange={(e) => setBiometrics({...biometrics, boneMass: e.target.value})}
                                        placeholder="e.g. 3.5"
                                        className={styles.metricInput}
                                    />
                                </div>
                            </div>
                            
                            <Button 
                                type="submit" 
                                disabled={isLoading}
                                className={styles.submitScanButton}
                            >
                                {isLoading ? (
                                    <>
                                        <svg className={styles.loadingSpinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span className={styles.loadingText}>Analyzing Biometrics...</span>
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
