"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  EyeOff,
  Check,
  Shield,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";

import {
  getCurrentUser,
  updateCurrentUser,
  changePassword,
} from "@/lib/profile-api";

export default function CustomerProfilePage() {
  // Get current user (customer)

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
 const [profile, setProfile] = useState({
  fullName: "",
  email: "",
  phone: "",
  availablePoints: 0,
});

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const me = await getCurrentUser();
        setProfile({
  fullName: me.fullName || "",
  email: me.email || "",
  phone: me.phone || "",
  availablePoints: me.availablePoints ?? 0,
});
      } catch (error) {
        console.error("Load profile failed:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);
  const passwordRequirements = [
    {
      label: "At least 8 characters",
      met: passwordForm.newPassword.length >= 8,
    },
    {
      label: "Contains uppercase letter",
      met: /[A-Z]/.test(passwordForm.newPassword),
    },
    {
      label: "Contains lowercase letter",
      met: /[a-z]/.test(passwordForm.newPassword),
    },
    { label: "Contains a number", met: /\d/.test(passwordForm.newPassword) },
  ];
  const isPasswordValid =
    passwordRequirements.every((r) => r.met) &&
    passwordForm.newPassword === passwordForm.newPasswordConfirm;
  const handleChangePassword = async () => {
    try {
      setSaving(true);

      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        newPasswordConfirm: passwordForm.newPasswordConfirm,
      });

      alert("Đổi mật khẩu thành công");

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        newPasswordConfirm: "",
      });
    } catch (error) {
      console.error("Change password failed:", error);
      alert(error instanceof Error ? error.message : "Đổi mật khẩu thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">
          View your account information and change password
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Info Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <Avatar className="mx-auto h-24 w-24">
              <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                {profile.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="mt-4">{profile.fullName}</CardTitle>
            <CardDescription>
              <Badge variant="secondary">Customer</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{profile.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{profile.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
  <Shield className="h-4 w-4 text-muted-foreground" />
  <span>Available Points: {profile.availablePoints}</span>
</div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
           
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            {passwordChanged && (
              <div className="mb-6 flex items-center gap-2 rounded-lg bg-accent/20 p-4 text-accent">
                <Check className="h-5 w-5" />
                <span className="font-medium">
                  Password changed successfully!
                </span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value,
                      })
                    }
                    placeholder="Enter your current password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    placeholder="Enter your new password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {passwordForm.newPassword && (
                  <ul className="mt-2 space-y-1">
                    {passwordRequirements.map((req) => (
                      <li
                        key={req.label}
                        className={`flex items-center gap-2 text-xs ${
                          req.met ? "text-accent" : "text-muted-foreground"
                        }`}
                      >
                        <Check
                          className={`h-3 w-3 ${req.met ? "opacity-100" : "opacity-30"}`}
                        />
                        {req.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.newPasswordConfirm}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPasswordConfirm: e.target.value,
                    })
                  }
                  placeholder="Confirm your new password"
                  required
                />
                {passwordForm.newPasswordConfirm &&
                  passwordForm.newPassword !==
                    passwordForm.newPasswordConfirm && (
                    <p className="text-xs text-destructive">
                      Passwords do not match
                    </p>
                  )}
              </div>

              <Button
                type="submit"
                disabled={
                  !isPasswordValid || !passwordForm.currentPassword || saving
                }
                className="w-full sm:w-auto"
              >
                {saving ? 'Changing Password...' : 'Change Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Account Info Notice */}
      <Card className="border-muted bg-muted/30">
        <CardContent className="flex items-start gap-4 pt-6">
          <Shield className="h-6 w-6 text-muted-foreground" />
          <div>
            <h3 className="font-medium">
              Need to update your profile information?
            </h3>
            <p className="text-sm text-muted-foreground">
              To update your name, email, or phone number, please contact our
              customer support team. This helps us ensure your account security.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
