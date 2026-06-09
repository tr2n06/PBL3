"use client";

import { FormEvent, useEffect, useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  EyeOff,
  Check,
  Shield,
  Mail,
  Phone,
  Calendar,
  User,
  MapPin,
  RefreshCcw,
} from "lucide-react";

import {
  getCurrentUser,
  updateCurrentUser,
  changePassword,
} from "@/lib/profile-api";

type GenderValue = "Male" | "Female" | "";

type CustomerProfileForm = {
  fullName: string;
  email: string;
  phone: string;
  gender: GenderValue;
  dateOfBirth: string;
  address: string;
  availablePoints: number;
};

type UpdateProfilePayload = Parameters<typeof updateCurrentUser>[0] & {
  gender?: string;
  dateOfBirth?: string;
  address?: string;
};

function getInitials(fullName: string) {
  const initials = fullName
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return initials || "CU";
}

function toDateInputValue(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

function formatGender(value?: string) {
  if (value === "Male") return "Nam";
  if (value === "Female") return "Nữ";
  return "—";
}

export default function CustomerProfilePage() {
  const [profile, setProfile] = useState<CustomerProfileForm>({
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    address: "",
    availablePoints: 0,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
  });

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setProfileError("");

      const me = (await getCurrentUser()) as Awaited<
        ReturnType<typeof getCurrentUser>
      > & {
        gender?: string;
        dateOfBirth?: string;
        address?: string;
      };

      setProfile({
        fullName: me.fullName || "",
        email: me.email || "",
        phone: me.phone || "",
        gender: me.gender === "Male" || me.gender === "Female" ? me.gender : "",
        dateOfBirth: toDateInputValue(me.dateOfBirth),
        address: me.address || "",
        availablePoints: me.availablePoints ?? 0,
      });
    } catch (error) {
      console.error("Load profile failed:", error);
      setProfileError(
        error instanceof Error
          ? error.message
          : "Không lấy được thông tin hồ sơ",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
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
    {
      label: "Contains a number",
      met: /\d/.test(passwordForm.newPassword),
    },
  ];

  const isPasswordValid =
    passwordRequirements.every((r) => r.met) &&
    passwordForm.newPassword === passwordForm.newPasswordConfirm;

  const handleUpdateProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSavingProfile(true);
      setProfileMessage("");
      setProfileError("");

      const payload: UpdateProfilePayload = {
        fullName: profile.fullName.trim(),
        phone: profile.phone.trim(),
        gender: profile.gender || undefined,
        dateOfBirth: profile.dateOfBirth || undefined,
        address: profile.address.trim(),
      };

      await updateCurrentUser(payload);
      await loadProfile();

      setProfileMessage("Cập nhật hồ sơ thành công");
    } catch (error) {
      console.error("Update profile failed:", error);
      setProfileError(
        error instanceof Error ? error.message : "Cập nhật hồ sơ thất bại",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSavingPassword(true);
      setPasswordMessage("");
      setPasswordError("");

      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        newPasswordConfirm: passwordForm.newPasswordConfirm,
      });

      setPasswordMessage("Đổi mật khẩu thành công");

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        newPasswordConfirm: "",
      });
    } catch (error) {
      console.error("Change password failed:", error);
      setPasswordError(
        error instanceof Error ? error.message : "Đổi mật khẩu thất bại",
      );
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account information and security settings
        </p>
      </div>

      {loading && (
        <Card className="border-dashed">
          <CardContent className="flex items-center gap-3 py-8">
            <RefreshCcw className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Loading profile...
            </span>
          </CardContent>
        </Card>
      )}

      {!loading && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Summary */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center">
              <Avatar className="mx-auto h-24 w-24">
                <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                  {getInitials(profile.fullName)}
                </AvatarFallback>
              </Avatar>

              <CardTitle className="mt-4">
                {profile.fullName || "Customer"}
              </CardTitle>

              <CardDescription>
                <Badge variant="secondary">Customer</Badge>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="break-all">{profile.email || "—"}</span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{profile.phone || "—"}</span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{formatGender(profile.gender)}</span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{profile.dateOfBirth || "—"}</span>
              </div>

              <div className="flex items-start gap-3 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <span>{profile.address || "—"}</span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span>Available Points: {profile.availablePoints}</span>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Update your profile information or change your password
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="update-profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="update-profile">
                    Update Profile
                  </TabsTrigger>
                  <TabsTrigger value="change-password">
                    Change Password
                  </TabsTrigger>
                </TabsList>

                {/* Update Profile Tab */}
                <TabsContent value="update-profile">
                  {profileMessage && (
                    <div className="mb-6 flex items-center gap-2 rounded-lg bg-accent/20 p-4 text-accent">
                      <Check className="h-5 w-5" />
                      <span className="font-medium">{profileMessage}</span>
                    </div>
                  )}

                  {profileError && (
                    <div className="mb-6 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                      {profileError}
                    </div>
                  )}

                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={profile.fullName}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              fullName: e.target.value,
                            })
                          }
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          value={profile.email}
                          disabled
                          className="bg-muted"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={profile.phone}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              phone: e.target.value,
                            })
                          }
                          placeholder="Enter your phone number"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={profile.dateOfBirth}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              dateOfBirth: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Gender</Label>
                        <Select
                          value={profile.gender || "none"}
                          onValueChange={(value) =>
                            setProfile({
                              ...profile,
                              gender:
                                value === "none" ? "" : (value as GenderValue),
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Chưa chọn</SelectItem>
                            <SelectItem value="Male">Nam</SelectItem>
                            <SelectItem value="Female">Nữ</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="address">Address</Label>
                        <textarea
                          id="address"
                          value={profile.address}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              address: e.target.value,
                            })
                          }
                          placeholder="Enter your address"
                          rows={3}
                          className="flex min-h-[88px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={savingProfile}
                      className="w-full sm:w-auto"
                    >
                      {savingProfile ? "Saving Profile..." : "Save Profile"}
                    </Button>
                  </form>
                </TabsContent>

                {/* Change Password Tab */}
                <TabsContent value="change-password">
                  {passwordMessage && (
                    <div className="mb-6 flex items-center gap-2 rounded-lg bg-accent/20 p-4 text-accent">
                      <Check className="h-5 w-5" />
                      <span className="font-medium">{passwordMessage}</span>
                    </div>
                  )}

                  {passwordError && (
                    <div className="mb-6 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                      {passwordError}
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
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
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
                                req.met
                                  ? "text-accent"
                                  : "text-muted-foreground"
                              }`}
                            >
                              <Check
                                className={`h-3 w-3 ${
                                  req.met ? "opacity-100" : "opacity-30"
                                }`}
                              />
                              {req.label}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Confirm New Password
                      </Label>
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
                        !isPasswordValid ||
                        !passwordForm.currentPassword ||
                        savingPassword
                      }
                      className="w-full sm:w-auto"
                    >
                      {savingPassword
                        ? "Changing Password..."
                        : "Change Password"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
