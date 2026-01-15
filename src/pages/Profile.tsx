import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Phone, MapPin, Loader2, Edit } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";

const Profile = () => {
  const { user, refreshLevel, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    phone_number: "",
    avatar_url: ""
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        full_name: user.full_name || "",
        phone_number: user.phone_number || "",
        avatar_url: user.avatar_url || ""
      });
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      setIsEditing(false);
      refreshLevel(); // Refresh context
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;

    const file = e.target.files[0];
    const fileName = `${user.id}/avatar.${file.name.split('.').pop()}`;

    // Use a unique ID for this upload attempt
    const toastId = "avatar-upload";
    toast.loading("Uploading avatar...", { id: toastId });

    try {
      console.log("Starting avatar upload:", fileName);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error("Supabase Storage Error:", uploadError);
        throw uploadError;
      }
      console.log("Upload success:", uploadData);

      const { data } = supabase.storage.from('images').getPublicUrl(fileName);
      console.log("Public URL:", data.publicUrl);

      // Update profile immediately
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user.id);

      if (updateError) {
        console.error("Profile DB Update Error:", updateError);
        throw updateError;
      }

      setFormData({ ...formData, avatar_url: data.publicUrl });
      refreshLevel(); // Refresh context
      toast.success("Avatar updated!", { id: toastId });
    } catch (error: any) {
      console.error("Avatar Upload Catch Error:", error);
      toast.error(`Upload failed: ${error.message || "Unknown error"}`, { id: toastId });
    }
  };

  if (!user) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="animate-spin" />
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto py-12 px-4 max-w-3xl animate-in fade-in slide-in-from-bottom-5">
        <h1 className="text-4xl font-display font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
          My Profile
        </h1>

        <div className="grid gap-8">
          {/* Avatar Card */}
          <Card className="text-center py-6 shadow-custom-md border-primary/10">
            <CardContent>
              <div className="relative inline-block">
                <Avatar className="h-32 w-32 border-4 border-white shadow-xl mx-auto">
                  <AvatarImage src={formData.avatar_url} />
                  <AvatarFallback className="text-4xl bg-gradient-to-br from-primary to-primary/60 text-white">
                    {formData.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg cursor-pointer hover:bg-primary/90 transition-colors"
                  title="Change Avatar"
                >
                  <Edit className="w-4 h-4" />
                  <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </label>
              </div>
              <h2 className="mt-4 text-2xl font-bold">{formData.full_name || "User"}</h2>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary uppercase tracking-wide">
                {user.role}
              </div>
            </CardContent>
          </Card>

          {/* Details Form */}
          <Card className="shadow-lg border-primary/5">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Manage your personal details</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid gap-2">
                  <Label className="flex items-center gap-2"><User className="w-4 h-4" /> Full Name</Label>
                  <Input
                    value={formData.full_name}
                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                    className="h-11"
                    placeholder="John Doe"
                  />
                </div>

                <div className="grid gap-2">
                  <Label className="flex items-center gap-2"><Mail className="w-4 h-4" /> Email</Label>
                  <Input disabled value={user.email} className="h-11 bg-muted/50" />
                </div>

                <div className="grid gap-2">
                  <Label className="flex items-center gap-2"><Phone className="w-4 h-4" /> Phone Number</Label>
                  <Input
                    value={formData.phone_number}
                    onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                    className="h-11"
                    placeholder="+60..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={loading} className="w-full gradient-primary">
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default Profile;
