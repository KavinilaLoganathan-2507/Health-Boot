"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserDetails } from "@/types/userflow";
import { User, Phone, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function UserDetailsPage() {
  const router = useRouter();
  const [userDetails, setUserDetails] = useState<UserDetails>({
    name: "",
    phone: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Store user details in session storage to use across the flow
    sessionStorage.setItem("userDetails", JSON.stringify(userDetails));

    // Navigate to next step
    router.push("/onboarding/workout-frequency");
  };

  const containerVariants = {
    initial: { opacity: 0, y: 50 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };
  return (
    <div className="min-h-screen bg-[#F0EDE4] flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20"></div>

      <motion.div
        className="relative w-full max-w-md"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        <Card className="bg-[#F0EDE4] shadow-xl border-2 border-[#004743]/10">
          <CardHeader className="text-center space-y-4">
            <motion.div variants={itemVariants}>
              <CardTitle className="text-2xl flex font-bold bg-[#000] bg-clip-text text-transparent">
                Fill Your Details
              </CardTitle>
            </motion.div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-6">
                <motion.div variants={itemVariants}>
                  <Label htmlFor="name" className="text-black font-medium">
                    Full Name *
                  </Label>
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      required
                      value={userDetails.name}
                      onChange={(e) =>
                        setUserDetails({ ...userDetails, name: e.target.value })
                      }
                      className="pl-10 bg-[#FFFDF7] text-black placeholder:text-gray-500 border-2 border-gray-200 focus:border-[#004743] transition-all duration-300 h-12"
                      placeholder="Enter your full name"
                    />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Label htmlFor="phone" className="text-black font-medium">
                    Phone Number *
                  </Label>
                  <div className="relative mt-2">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={userDetails.phone}
                      onChange={(e) =>
                        setUserDetails({
                          ...userDetails,
                          phone: e.target.value,
                        })
                      }
                      className="pl-10 bg-[#FFFDF7] text-black placeholder:text-gray-500 border-2 border-gray-200 focus:border-[#004743] transition-all duration-300 h-12"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Label htmlFor="password" className="text-black font-medium">
                    Password *
                  </Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      required
                      value={userDetails.password}
                      onChange={(e) =>
                        setUserDetails({
                          ...userDetails,
                          password: e.target.value,
                        })
                      }
                      className="pl-10 bg-[#FFFDF7] text-black placeholder:text-gray-500 border-2 border-gray-200 focus:border-[#004743] transition-all duration-300 h-12"
                      placeholder="Enter your password"
                    />
                  </div>
                </motion.div>
              </div>

              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  className="w-full bg-[#004743] hover:bg-[#003a37] text-white font-medium py-6 text-lg transition-all duration-300 shadow-lg hover:shadow-xl mt-4"
                >
                  Continue
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
