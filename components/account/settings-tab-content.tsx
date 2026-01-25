"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ThemeToggle } from "@/components/theme-toggle";
import { AvatarUpload } from "@/components/account/avatar-upload";
import { PrivacyToggle } from "@/components/account/privacy-toggle";
import { NotificationToggle } from "@/components/account/notification-toggle";
import { Button } from "@/components/ui/button";
import { User, Shield, Bell, LogOut, Mail } from "lucide-react";
import { signOut } from "next-auth/react";
import { ProfileEditForm } from "@/components/account/profile-edit-form";

interface SettingsTabContentProps {
  session: any;
}

export function SettingsTabContent({ session }: SettingsTabContentProps) {
  const [privacySettings, setPrivacySettings] = useState<any>(null);
  const [notificationSettings, setNotificationSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
    fetchProfile();
  }, []);

  const fetchSettings = async () => {
    try {
      const [privacyRes, notifRes] = await Promise.all([
        fetch("/api/profile/privacy"),
        fetch("/api/notifications/preferences"),
      ]);

      if (privacyRes.ok) {
        const data = await privacyRes.json();
        setPrivacySettings(data);
      }

      if (notifRes.ok) {
        const data = await notifRes.json();
        setNotificationSettings(data);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  const updatePrivacySetting = async (field: string, value: boolean) => {
    setSaving(true);
    try {
      const response = await fetch("/api/profile/privacy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });

      if (response.ok) {
        setPrivacySettings((prev: any) => ({ ...prev, [field]: value }));
      }
    } catch (error) {
      console.error("Failed to update privacy setting:", error);
    } finally {
      setSaving(false);
    }
  };

  const updateNotificationSetting = async (field: string, value: boolean) => {
    setSaving(true);
    try {
      const response = await fetch("/api/notifications/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });

      if (response.ok) {
        setNotificationSettings((prev: any) => ({ ...prev, [field]: value }));
      }
    } catch (error) {
      console.error("Failed to update notification setting:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    if (confirm("Are you sure you want to sign out?")) {
      signOut({ callbackUrl: "/" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-text-secondary">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile Section */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-text-secondary" />
          <h2 className="text-xl font-semibold text-text-primary">Profile</h2>
        </div>
        <div className="space-y-6">
          {/* Avatar */}
          <div className="rounded-lg border border-border-default bg-background-surface p-6">
            <AvatarUpload
              currentAvatarUrl={profile?.avatar_url || null}
              avatarSource={profile?.avatar_source || "generated"}
              userId={session.user.id}
              handle={session.user.handle || session.user.email || "user"}
              onAvatarUpdate={fetchProfile}
            />
          </div>

          {/* Email (Read-only) */}
          <div className="flex items-center justify-between rounded-lg border border-border-default bg-background-surface p-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-text-secondary" />
              <div>
                <p className="font-medium text-text-primary">Email</p>
                <p className="text-sm text-text-secondary">{session.user.email}</p>
              </div>
            </div>
            <span className="rounded-full bg-background-elevated px-3 py-1 text-xs font-medium text-text-secondary">
              Verified
            </span>
          </div>

          {/* Handle/Username (Editable) */}
          <div className="rounded-lg border border-border-default bg-background-surface p-4">
            <ProfileEditForm
              currentHandle={session.user.handle || ""}
              onUpdate={fetchProfile}
            />
          </div>
        </div>
      </div>

      {/* Privacy Section */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-text-secondary" />
          <h2 className="text-xl font-semibold text-text-primary">Privacy</h2>
        </div>
        <div className="space-y-4">
          <PrivacyToggle
            label="Show my 'Going' status publicly"
            description="Allow others to see when you're going to events"
            checked={privacySettings?.show_going_publicly ?? true}
            onChange={(checked) => updatePrivacySetting("show_going_publicly", checked)}
            loading={saving}
          />
          <PrivacyToggle
            label="Show my profile publicly"
            description="Make your profile visible to other users"
            checked={privacySettings?.show_profile_publicly ?? true}
            onChange={(checked) => updatePrivacySetting("show_profile_publicly", checked)}
            loading={saving}
          />
          <PrivacyToggle
            label="Show my activity publicly"
            description="Display your submissions and activity on your profile"
            checked={privacySettings?.show_activity_publicly ?? true}
            onChange={(checked) => updatePrivacySetting("show_activity_publicly", checked)}
            loading={saving}
          />
          <PrivacyToggle
            label="Show my comments publicly"
            description="Make your comments visible on event pages"
            checked={privacySettings?.show_comments_publicly ?? true}
            onChange={(checked) => updatePrivacySetting("show_comments_publicly", checked)}
            loading={saving}
          />
          <PrivacyToggle
            label="Show my email publicly"
            description="Display your email address on your profile"
            checked={privacySettings?.show_email_publicly ?? false}
            onChange={(checked) => updatePrivacySetting("show_email_publicly", checked)}
            loading={saving}
          />
          <PrivacyToggle
            label="Allow direct messages"
            description="Let other users send you direct messages"
            checked={privacySettings?.allow_direct_messages ?? false}
            onChange={(checked) => updatePrivacySetting("allow_direct_messages", checked)}
            loading={saving}
          />
        </div>
      </div>

      {/* Notifications Section */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-text-secondary" />
          <h2 className="text-xl font-semibold text-text-primary">Notifications</h2>
        </div>
        <div className="space-y-4">
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-semibold text-text-primary">Event Notifications</h3>
            <div className="space-y-2">
              <NotificationToggle
                label="Event reminders"
                description="Get notified 24h and 1h before events you're going to"
                checked={notificationSettings?.email_event_reminders ?? true}
                onChange={(checked) => updateNotificationSetting("email_event_reminders", checked)}
                loading={saving}
              />
              <NotificationToggle
                label="Event updates"
                description="Notifications when events you're interested in are updated"
                checked={notificationSettings?.email_event_updates ?? true}
                onChange={(checked) => updateNotificationSetting("email_event_updates", checked)}
                loading={saving}
              />
              <NotificationToggle
                label="New matching events"
                description="Get notified about new events matching your interests"
                checked={notificationSettings?.email_new_matching_events ?? true}
                onChange={(checked) => updateNotificationSetting("email_new_matching_events", checked)}
                loading={saving}
              />
            </div>
          </div>

          <div className="mb-4">
            <h3 className="mb-2 text-sm font-semibold text-text-primary">Social Notifications</h3>
            <div className="space-y-2">
              <NotificationToggle
                label="New comments"
                description="Notifications when someone comments on your submissions"
                checked={notificationSettings?.email_comments ?? true}
                onChange={(checked) => updateNotificationSetting("email_comments", checked)}
                loading={saving}
              />
              <NotificationToggle
                label="Comment replies"
                description="Notifications when someone replies to your comments"
                checked={notificationSettings?.email_comment_replies ?? true}
                onChange={(checked) => updateNotificationSetting("email_comment_replies", checked)}
                loading={saving}
              />
              <NotificationToggle
                label="Going notifications"
                description="Notifications when someone marks 'Going' to your events"
                checked={notificationSettings?.email_going_notifications ?? true}
                onChange={(checked) => updateNotificationSetting("email_going_notifications", checked)}
                loading={saving}
              />
            </div>
          </div>

          <div className="mb-4">
            <h3 className="mb-2 text-sm font-semibold text-text-primary">Account Notifications</h3>
            <div className="space-y-2">
              <NotificationToggle
                label="Submission updates"
                description="Notifications when your event submissions are approved or rejected"
                checked={notificationSettings?.email_submission_updates ?? true}
                onChange={(checked) => updateNotificationSetting("email_submission_updates", checked)}
                loading={saving}
              />
              <NotificationToggle
                label="Claim updates"
                description="Notifications about venue claim requests"
                checked={notificationSettings?.email_claim_updates ?? true}
                onChange={(checked) => updateNotificationSetting("email_claim_updates", checked)}
                loading={saving}
              />
              <NotificationToggle
                label="Security alerts"
                description="Important security notifications about your account"
                checked={notificationSettings?.email_security_alerts ?? true}
                onChange={(checked) => updateNotificationSetting("email_security_alerts", checked)}
                loading={saving}
              />
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-text-primary">Newsletter</h3>
            <div className="space-y-2">
              <NotificationToggle
                label="Newsletter"
                description="Receive our weekly newsletter with featured events"
                checked={notificationSettings?.email_newsletter ?? false}
                onChange={(checked) => updateNotificationSetting("email_newsletter", checked)}
                loading={saving}
              />
              <NotificationToggle
                label="Weekly digest"
                description="Get a weekly summary of events and updates"
                checked={notificationSettings?.email_weekly_digest ?? false}
                onChange={(checked) => updateNotificationSetting("email_weekly_digest", checked)}
                loading={saving}
              />
              <NotificationToggle
                label="Featured events"
                description="Notifications about specially featured events"
                checked={notificationSettings?.email_featured_events ?? false}
                onChange={(checked) => updateNotificationSetting("email_featured_events", checked)}
                loading={saving}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Appearance Section */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-text-primary">Appearance</h2>
        <div className="flex items-center justify-between rounded-lg border border-border-default bg-background-surface p-4">
          <div>
            <p className="font-medium text-text-primary">Theme</p>
            <p className="text-sm text-text-secondary">Choose light or dark mode</p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Security Section */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-text-secondary" />
          <h2 className="text-xl font-semibold text-text-primary">Security</h2>
        </div>
        <div className="rounded-lg border border-border-default bg-background-surface p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text-primary">Sign Out</p>
              <p className="text-sm text-text-secondary">
                Sign out of your account on this device
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
