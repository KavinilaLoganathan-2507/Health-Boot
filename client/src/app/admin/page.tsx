"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, PieChart, TrendingUp, ShieldAlert } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-[#F5F3F0] p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-[#004743]">Admin Analytics & Research</h1>
          <p className="text-gray-600 text-lg mt-2">Campus wellness population insights and predictive analytics.</p>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Scans Today</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">1,204</div>
              <p className="text-xs text-green-600 mt-1">+12% from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Campus Hydration</CardTitle>
              <PieChart className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">58%</div>
              <p className="text-xs text-yellow-600 mt-1">Below target (60%)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Elevated Stress/BP</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">14%</div>
              <p className="text-xs text-red-600 mt-1">Spike around exam period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Data Privacy Status</CardTitle>
              <ShieldAlert className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">Encrypted</div>
              <p className="text-xs text-gray-500 mt-1">100% records anonymized</p>
            </CardContent>
          </Card>
        </div>

        {/* Deep Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Population Insights</CardTitle>
              <CardDescription>Campus-wide health trends and nutritional gaps</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Protein Deficiency Risk</span>
                  <span className="text-orange-500">22% of Students</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-400 h-2 rounded-full" style={{ width: '22%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-sm font-medium">
                  <span>Sedentary Lifestyle Marker</span>
                  <span className="text-red-500">45% of Students</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-400 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-sm font-medium">
                  <span>Optimal Sleep Patterns</span>
                  <span className="text-green-500">38% of Students</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-400 h-2 rounded-full" style={{ width: '38%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Predictive Analytics</CardTitle>
              <CardDescription>Forecasted health risks to enable proactive interventions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                <h4 className="font-semibold text-red-800 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Upcoming Flu/Cold Spike
                </h4>
                <p className="text-sm text-red-700 mt-2">
                  Based on recent trends in immune markers and sleep deprivation, predict a 30% increase in clinic visits next week. 
                  <strong> Action:</strong> Deploy vitamin C availability alerts to student dashboards.
                </p>
              </div>
              
              <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
                <h4 className="font-semibold text-yellow-800 flex items-center">
                  <PieChart className="w-4 h-4 mr-2" />
                  Finals Week Stress Index
                </h4>
                <p className="text-sm text-yellow-700 mt-2">
                  Historical data indicates a severe drop in hydration and spike in resting HR in 3 weeks.
                  <strong> Action:</strong> Push proactive wellness and meditation tips to the AI Chatbot.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
