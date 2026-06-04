import { User } from "lucide-react";
import { RoleOption } from "@/types/userflow";

export const ROLE_OPTIONS: RoleOption[] = [
  {
    id: "user",
    title: "Continue as User",
    description: "Browse and purchase products from verified vendors",
    icon: <User className="w-6 h-6" />,
    color: "#00A4EB", // Solid blue color
    features: [
      "Browse Products",
      "Make Purchases",
      "Track Orders",
      "Rate & Review",
    ],
  },
];
