import { ArrowLeft, ChevronRight } from "lucide-react";
import { RoleOption } from "@/types/userflow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface RoleSelectionStepProps {
  roleOptions: RoleOption[];
  selectedRole: string;
  onRoleSelect: (roleId: string) => void;
  onBack: () => void;
}

const RoleSelectionStep = ({
  roleOptions,
  selectedRole,
  onRoleSelect,
  onBack,
}: RoleSelectionStepProps) => (
  <Card className="bg-[#F5F3F0] backdrop-blur-xl">
    <CardHeader className="text-center space-y-4">
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "#000",
            marginBottom: "12px",
            lineHeight: "1.2",
          }}
        >
          Who are you?
        </h1>
        <p
          style={{
            fontSize: "16px",
            color: "#666",
            lineHeight: "1.4",
            margin: 0,
          }}
        >
          We&apos;ll personalize recommendations based on what matters to you.
        </p>
      </div>
    </CardHeader>

    <CardContent className="space-y-4">
      <div className="text-center mb-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Wallet
        </Button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {roleOptions.map((role) => (
          <div
            key={role.id}
            onClick={() => onRoleSelect(role.id)}
            style={{
              backgroundColor: "#fff",
              border: `2px solid ${
                selectedRole === role.id ? role.color : "#E5E5E5"
              }`,
              borderRadius: "16px",
              padding: "20px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              transform: selectedRole === role.id ? "scale(1.02)" : "scale(1)",
              boxShadow:
                selectedRole === role.id
                  ? "0 8px 25px rgba(0,0,0,0.1)"
                  : "0 2px 10px rgba(0,0,0,0.05)",
            }}
            onMouseEnter={(e) => {
              if (selectedRole !== role.id) {
                e.currentTarget.style.transform = "scale(1.01)";
                e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.08)";
              }
            }}
            onMouseLeave={(e) => {
              if (selectedRole !== role.id) {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.05)";
              }
            }}
          >
            <div
              style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: `${role.color}`,
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  color: "#fff",
                }}
              >
                {role.icon}
              </div>

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#000",
                      margin: 0,
                    }}
                  >
                    {role.title}
                  </h3>
                  <ChevronRight size={20} style={{ color: "#999" }} />
                </div>

                <p
                  style={{
                    fontSize: "14px",
                    color: "#666",
                    lineHeight: "1.4",
                    margin: "0 0 16px 0",
                  }}
                >
                  {role.description}
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {role.features.map((feature, index) => (
                    <span
                      key={index}
                      style={{
                        fontSize: "12px",
                        color: "#666",
                        backgroundColor: "#F8F8F8",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        border: "1px solid #E5E5E5",
                      }}
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Separator className="bg-white/10 my-6" />

      <div className="text-center">
        <p className="text-xs text-gray-500">
          You can change your role later in account settings
        </p>
      </div>
    </CardContent>
  </Card>
);

export default RoleSelectionStep;
