import { UserDetails } from "@/types/userflow";
import { User, Phone, ChevronRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface UserDetailsStepProps {
  userDetails: UserDetails;
  setUserDetails: (details: UserDetails) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const UserDetailsStep = ({
  userDetails,
  setUserDetails,
  onSubmit,
}: UserDetailsStepProps) => (
  <Card className="bg-[#F0EDE4] ">
    <CardHeader className="text-center space-y-4">
      <div>
        <CardTitle className="text-2xl flex font-bold bg-[#000] bg-clip-text text-transparent">
          Fill your Details
        </CardTitle>
      </div>
    </CardHeader>

    <CardContent>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-12">
          <div>
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
                className="pl-10 bg-[#FFFDF7] text-black placeholder:text-gray-500"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          <div>
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
                  setUserDetails({ ...userDetails, phone: e.target.value })
                }
                className="pl-10 bg-[#FFFDF7] text-black placeholder:text-gray-500"
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password" className="text-black font-medium">
              Password *
            </Label>
            <div className="relative mt-2">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="password"
                type="password"
                required
                value={userDetails.password}
                onChange={(e) =>
                  setUserDetails({ ...userDetails, password: e.target.value })
                }
                className="pl-10 bg-[#FFFDF7] text-black placeholder:text-gray-500"
                placeholder="Enter your password"
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-[#004743] text-white font-medium py-3 transition-all duration-300 transform hover:scale-[1.02] mt-4"
        >
          Continue to Wallet Setup
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </form>
    </CardContent>
  </Card>
);

export default UserDetailsStep;
