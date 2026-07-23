"use client";

import { useState, useEffect } from "react";
import {
  User, Lock, Edit3, CheckCircle2, Camera, Loader2,
  Bookmark, Upload, BookOpen, Clock, Palette, Shield, LogOut, ExternalLink, Trash2
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState("profile");

  const [user, setUser] = useState({ name: "", email: "", bio: "", createdAt: "", image: "" });
  const [loading, setLoading] = useState(true);

  // Saved recipes state
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [loadingSavedRecipes, setLoadingSavedRecipes] = useState(false);

  // Uploaded recipes state
  const [uploadedRecipes, setUploadedRecipes] = useState([]);
  const [loadingUploadedRecipes, setLoadingUploadedRecipes] = useState(false);

  // Saved articles state
  const [savedArticles, setSavedArticles] = useState([]);
  const [loadingSavedArticles, setLoadingSavedArticles] = useState(false);

  // Recently viewed state
  const [recentViews, setRecentViews] = useState([]);

  // Profile edit state
  const [editForm, setEditForm] = useState({ name: "", bio: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });
  const [uploadingImage, setUploadingImage] = useState(false);

  // Password edit state
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      const data = await res.json();
      if (res.status === 401 || data.error === "Unauthorized") {
        window.location.href = "/login";
        return;
      }
      if (data?.data?.user) {
        setUser(data.data.user);
        setEditForm({ name: data.data.user.name || "", bio: data.data.user.bio || "" });
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "saved_recipes") {
      fetchSavedRecipes();
    } else if (activeTab === "uploaded_recipes") {
      fetchUploadedRecipes();
    } else if (activeTab === "saved_articles") {
      fetchSavedArticles();
    } else if (activeTab === "recently_viewed") {
      try {
        const stored = JSON.parse(localStorage.getItem('recently_viewed') || '[]');
        setRecentViews(stored.slice(0, 6));
      } catch (e) {
        setRecentViews([]);
      }
    }
  }, [activeTab]);

  const fetchSavedRecipes = async () => {
    setLoadingSavedRecipes(true);
    try {
      const res = await fetch("/api/user/saved-recipes");
      if (res.ok) {
        const data = await res.json();
        if (data?.data?.recipes) {
          setSavedRecipes(data.data.recipes);
        }
      }
    } catch (err) {
      console.error("Failed to fetch saved recipes", err);
    } finally {
      setLoadingSavedRecipes(false);
    }
  };

  const fetchUploadedRecipes = async () => {
    setLoadingUploadedRecipes(true);
    try {
      const res = await fetch("/api/user/recipes");
      if (res.ok) {
        const data = await res.json();
        if (data?.data?.recipes) {
          setUploadedRecipes(data.data.recipes);
        }
      }
    } catch (err) {
      console.error("Failed to fetch uploaded recipes", err);
    } finally {
      setLoadingUploadedRecipes(false);
    }
  };

  const fetchSavedArticles = async () => {
    setLoadingSavedArticles(true);
    try {
      const res = await fetch("/api/user/saved-articles");
      if (res.ok) {
        const data = await res.json();
        if (data?.data?.articles) {
          setSavedArticles(data.data.articles);
        }
      }
    } catch (err) {
      console.error("Failed to fetch saved articles", err);
    } finally {
      setLoadingSavedArticles(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data?.data?.user) {
        setUser(data.data.user);
        setProfileMessage({ type: "success", text: "Profile updated successfully!" });
        setTimeout(() => setProfileMessage({ type: "", text: "" }), 3000);
      } else {
        setProfileMessage({ type: "error", text: data.error || "Failed to update profile." });
      }
    } catch (err) {
      console.error(err);
      setProfileMessage({ type: "error", text: "Failed to update profile." });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setProfileMessage({ type: "", text: "" });
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();

      if (uploadData?.data?.media?.url || uploadData?.data?.media?.secureUrl) {
        const imageUrl = uploadData.data.media.secureUrl || uploadData.data.media.url;

        // Update profile with new image
        const updateRes = await fetch("/api/user/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...editForm, image: imageUrl }),
        });

        const updateData = await updateRes.json();
        if (updateData?.data?.user) {
          setUser(updateData.data.user);
          setProfileMessage({ type: "success", text: "Profile picture updated successfully!" });
          setTimeout(() => setProfileMessage({ type: "", text: "" }), 3000);
        } else {
          setProfileMessage({ type: "error", text: "Failed to save profile picture." });
        }
      } else {
        setProfileMessage({ type: "error", text: "Failed to upload image." });
      }
    } catch (err) {
      console.error("Failed to upload image", err);
      setProfileMessage({ type: "error", text: "Failed to upload profile picture." });
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    setSavingPassword(true);
    setPasswordMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok && !data.error) {
        setPasswordMessage({ type: "success", text: "Password changed successfully!" });
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setPasswordMessage({ type: "error", text: data.error || "Failed to change password." });
      }
    } catch (err) {
      console.error(err);
      setPasswordMessage({ type: "error", text: "Something went wrong." });
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-medium">Loading profile...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Header />

      <div className="max-w-5xl mx-auto px-4 py-32 sm:px-6 lg:px-8">
        <h1 className="main-heading text-slate-900 mb-8">My Account</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <nav className="flex flex-col p-4 gap-1">
                <div className="card-title text-slate-800 tracking-tight mb-2">Personal Info</div>
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "profile"
                      ? "bg-[#0F766E] text-white text-base font-semibold"
                      : "text-slate-600 hover:bg-slate-50 text-base"
                    }`}
                >
                  <User className="w-5 h-5" />
                  My Profile
                </button>
                <button
                  onClick={() => setActiveTab("edit")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "edit"
                      ? "bg-[#0F766E] text-white text-base font-semibold"
                      : "text-slate-600 hover:bg-slate-50 text-base"
                    }`}
                >
                  <Edit3 className="w-5 h-5" />
                  Edit Profile
                </button>
                <button
                  onClick={() => setActiveTab("password")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "password"
                      ? "bg-[#0F766E] text-white text-base font-semibold"
                      : "text-slate-600 hover:bg-slate-50 text-base"
                    }`}
                >
                  <Lock className="w-5 h-5" />
                  Change Password
                </button>

                <div className="card-title text-slate-800 tracking-tight mb-2 mt-4">🍽️ Recipes & Community</div>
                <button
                  onClick={() => setActiveTab("saved_recipes")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "saved_recipes"
                      ? "bg-[#0F766E] text-white text-base font-semibold"
                      : "text-slate-600 hover:bg-slate-50 text-base"
                    }`}
                >
                  <Bookmark className="w-5 h-5" />
                  Saved Recipes
                </button>
                <button
                  onClick={() => setActiveTab("uploaded_recipes")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "uploaded_recipes"
                      ? "bg-[#0F766E] text-white text-base font-semibold"
                      : "text-slate-600 hover:bg-slate-50 text-base"
                    }`}
                >
                  <Upload className="w-5 h-5" />
                  My Uploaded Recipes
                </button>

                <div className="card-title text-slate-800 tracking-tight mb-2 mt-4">📚 Content & Learning</div>
                <button
                  onClick={() => setActiveTab("saved_articles")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "saved_articles"
                      ? "bg-[#0F766E] text-white text-base font-semibold"
                      : "text-slate-600 hover:bg-slate-50 text-base"
                    }`}
                >
                  <BookOpen className="w-5 h-5" />
                  Saved Articles
                </button>

                <button
                  onClick={() => setActiveTab("recently_viewed")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "recently_viewed"
                      ? "bg-[#0F766E] text-white text-base font-semibold"
                      : "text-slate-600 hover:bg-slate-50 text-base"
                    }`}
                >
                  <Clock className="w-5 h-5" />
                  Recently Viewed Content
                </button>


                <div className="card-title text-slate-800 tracking-tight mb-2 mt-4">🚪 Account Actions</div>
                <button
                  onClick={() => { window.location.href = "/login"; }}
                  className="flex items-center gap-3 px-4 py-3 text-base rounded-xl transition-colors text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
              {activeTab === "profile" && (
                <div>
                  <h2 className="section-heading text-slate-900 mb-6 border-b pb-4">My Profile</h2>

                  {/* Dashboard shortcut card */}
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm mb-8">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">📊</span>
                      <div className="text-left">
                        <h4 className="font-bold text-slate-900">Wellness Dashboard active</h4>
                        <p className="text-slate-500 text-sm mt-0.5">Your scores and personalized profiles are stored in your dashboard.</p>
                      </div>
                    </div>
                    <Link href="/quizzes/dashboard" className="bg-[#0F766E] hover:bg-[#0d655e] shrink-0 text-white px-6 py-2.5 rounded-full text-sm md:text-base font-bold transition-all shadow-sm">
                      Go to Dashboard
                    </Link>
                  </div>

                  {/* Read-Only Info */}
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
                    <div className="relative w-24 h-24 shrink-0 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 overflow-hidden">
                      {user.image ? (
                        <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-12 h-12" />
                      )}
                    </div>
                    <div className="flex-1 w-full">
                      <h3 className="card-title text-slate-900 mb-2">{user.name || "Add a name"}</h3>
                      <p className="text-slate-600 mb-4 whitespace-pre-wrap">{user.bio || "No bio added yet."}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div>
                          <p className="text-sm font-medium text-slate-500 mb-1">Email Address</p>
                          <p className="text-base text-slate-900">{user.email}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-500 mb-1">Joined Date</p>
                          <p className="text-base text-slate-900">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "edit" && (
                <div>
                  <h2 className="section-heading text-slate-900 mb-6 border-b pb-4">Edit Profile</h2>

                  <div className="mb-6 flex flex-col items-start gap-4">
                    <div className="relative w-24 h-24 shrink-0 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 overflow-hidden border border-slate-300">
                      {user.image ? (
                        <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-12 h-12" />
                      )}
                      {uploadingImage && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        </div>
                      )}
                    </div>
                    <label className="cursor-pointer bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm md:text-base font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      {uploadingImage ? "Uploading..." : "Upload Picture"}
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                    </label>
                  </div>

                  <form onSubmit={handleProfileSave} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-4 py-2 text-base placeholder:text-sm focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] outline-none transition-all"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                      <textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-4 py-2 text-base placeholder:text-sm focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] outline-none transition-all"
                        rows="4"
                        placeholder="Tell us about yourself..."
                      ></textarea>
                    </div>

                    {profileMessage.text && (
                      <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg font-medium ${profileMessage.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-teal-50 text-[#0F766E]'
                        }`}>
                        <CheckCircle2 className="w-4 h-4" />
                        {profileMessage.text}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="bg-[#0F766E] hover:bg-[#0d655e] disabled:opacity-70 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg text-sm md:text-base font-semibold transition-colors flex items-center gap-2 mt-4"
                    >
                      {savingProfile ? "Saving..." : "Save Changes"}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === "password" && (
                <div>
                  <h2 className="section-heading text-slate-900 mb-6 border-b pb-4">Change Password</h2>
                  <form onSubmit={handlePasswordSave} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        required
                        className="w-full border border-slate-300 rounded-lg px-4 py-2 text-base placeholder:text-sm focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        required
                        minLength={6}
                        className="w-full border border-slate-300 rounded-lg px-4 py-2 text-base placeholder:text-sm focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        required
                        minLength={6}
                        className="w-full border border-slate-300 rounded-lg px-4 py-2 text-base placeholder:text-sm focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] outline-none transition-all"
                      />
                    </div>

                    {passwordMessage.text && (
                      <div className={`text-sm px-3 py-2 rounded-lg font-medium ${passwordMessage.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-teal-50 text-[#0F766E]'
                        }`}>
                        {passwordMessage.text}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={savingPassword}
                      className="bg-[#0F766E] hover:bg-[#0d655e] disabled:opacity-70 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg text-sm md:text-base font-semibold transition-colors mt-4"
                    >
                      {savingPassword ? "Updating..." : "Update Password"}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === "saved_recipes" && (
                <div>
                  <h2 className="section-heading text-slate-900 mb-6 border-b pb-4">Saved Recipes</h2>

                  {loadingSavedRecipes ? (
                    <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#0F766E]" /></div>
                  ) : savedRecipes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {savedRecipes.map(recipe => (
                        <div key={recipe.id} className="flex gap-4 border border-slate-200 rounded-xl p-4 bg-slate-50 hover:bg-white transition-colors group relative">
                          <div className="w-20 h-20 bg-slate-200 rounded-lg overflow-hidden shrink-0">
                            {recipe.imageUrl ? (
                              <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <Bookmark className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 flex flex-col justify-center">
                            <h3 className="font-bold text-slate-900 text-sm line-clamp-2">{recipe.title}</h3>
                            <div className="flex items-center gap-3 mt-2">
                              <Link href={`/recipes/${recipe.id}`} className="text-xs font-semibold text-[#0F766E] hover:underline flex items-center gap-1">
                                <ExternalLink className="w-3 h-3" /> View
                              </Link>
                              <button
                                onClick={async () => {
                                  try {
                                    await fetch(`/api/user/saved-recipes?recipeId=${recipe.id}`, { method: "DELETE" });
                                    fetchSavedRecipes();
                                  } catch (err) { }
                                }}
                                className="text-xs font-semibold text-rose-500 hover:underline flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" /> Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                      <Bookmark className="w-12 h-12 mb-4 text-slate-300" />
                      <p className="font-medium text-lg">No saved recipes yet</p>
                      <p className="text-sm">Recipes you save will appear here.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "uploaded_recipes" && (
                <div>
                  <h2 className="section-heading text-slate-900 mb-6 border-b pb-4">My Uploaded Recipes</h2>

                  {loadingUploadedRecipes ? (
                    <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#0F766E]" /></div>
                  ) : uploadedRecipes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {uploadedRecipes.map(recipe => (
                        <div key={recipe.id} className="flex gap-4 border border-slate-200 rounded-xl p-4 bg-slate-50 hover:bg-white transition-colors group relative">
                          <div className="w-20 h-20 bg-slate-200 rounded-lg overflow-hidden shrink-0">
                            {recipe.imageUrl ? (
                              <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                                <Upload className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 flex flex-col justify-center">
                            <h3 className="font-bold text-slate-900 text-sm line-clamp-2">{recipe.title}</h3>
                            <div className="mt-1 flex items-center gap-2">
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${recipe.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                                  recipe.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' :
                                    'bg-amber-100 text-amber-700'
                                }`}>
                                {recipe.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-2">
                              {recipe.status === 'APPROVED' && (
                                <Link href={`/recipes/${recipe.id}`} className="text-xs font-semibold text-[#0F766E] hover:underline flex items-center gap-1">
                                  <ExternalLink className="w-3 h-3" /> View Page
                                </Link>
                              )}
                              {recipe.status === 'PENDING' && (
                                <span className="text-xs text-slate-500 italic">Under review</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                      <Upload className="w-12 h-12 mb-4 text-slate-300" />
                      <p className="font-medium text-lg">No uploaded recipes</p>
                      <p className="text-sm">Share your culinary creations with the community.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "saved_articles" && (
                <div>
                  <h2 className="section-heading text-slate-900 mb-6 border-b pb-4">Saved Articles</h2>

                  {loadingSavedArticles ? (
                    <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#0F766E]" /></div>
                  ) : savedArticles.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {savedArticles.map(article => {
                        const slug = article.slug || article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                        return (
                          <div key={article.id} className="flex gap-4 border border-slate-200 rounded-xl p-4 bg-slate-50 hover:bg-white transition-colors group relative">
                            <div className="w-20 h-20 bg-slate-200 rounded-lg overflow-hidden shrink-0">
                              {article.featuredImage?.secureUrl || article.featuredImage?.url ? (
                                <img src={article.featuredImage.secureUrl || article.featuredImage.url} alt={article.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                  <BookOpen className="w-6 h-6" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                              <h3 className="font-bold text-slate-900 text-sm line-clamp-2">{article.title}</h3>
                              <div className="flex items-center gap-3 mt-2">
                                <Link href={`/blogs/${slug}`} className="text-xs font-semibold text-[#0F766E] hover:underline flex items-center gap-1">
                                  <ExternalLink className="w-3 h-3" /> Read
                                </Link>
                                <button
                                  onClick={async () => {
                                    try {
                                      await fetch(`/api/user/saved-articles?postId=${article.id}`, { method: "DELETE" });
                                      fetchSavedArticles();
                                    } catch (err) { }
                                  }}
                                  className="text-xs font-semibold text-rose-500 hover:underline flex items-center gap-1"
                                >
                                  <Trash2 className="w-3 h-3" /> Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                      <BookOpen className="w-12 h-12 mb-4 text-slate-300" />
                      <p className="font-medium text-lg">No saved articles</p>
                      <p className="text-sm">Articles you bookmark will be stored here.</p>
                    </div>
                  )}
                </div>
              )}



              {activeTab === "recently_viewed" && (
                <div>
                  <h2 className="section-heading text-slate-900 mb-6 border-b pb-4">Recently Viewed Content</h2>
                  {recentViews.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {recentViews.map((item, idx) => (
                        <div key={item.url || idx} className="flex gap-4 border border-slate-200 rounded-xl p-4 bg-slate-50 hover:bg-white transition-colors group relative">
                          <div className="w-20 h-20 bg-slate-200 rounded-lg overflow-hidden shrink-0">
                            {item.image ? (
                              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                                <Clock className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 flex flex-col justify-center">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F766E] mb-1">{item.type}</span>
                            <h3 className="font-bold text-slate-900 text-sm line-clamp-2">{item.title}</h3>
                            <div className="mt-2">
                              <Link href={item.url || "#"} className="text-xs font-semibold text-[#0F766E] hover:underline flex items-center gap-1">
                                <ExternalLink className="w-3 h-3" /> View Again
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                      <Clock className="w-12 h-12 mb-4 text-slate-300" />
                      <p className="font-medium text-lg">No recent activity</p>
                    </div>
                  )}
                </div>
              )}


            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
