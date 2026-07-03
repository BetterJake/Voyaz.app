export type ConnectionStatus = "none" | "pending" | "accepted" | "incoming_pending";

export type NotificationType =
  | "friend_request"
  | "new_follower"
  | "friend_accept"
  | "trip_shared"
  | "friend_request_cancel"
  | "sync";

export interface SocialUser {
  id: string;
  username: string;
  avatar_url?: string;
}

export interface SocialNotification {
  id: string;
  recipient_id: string;
  actor_id: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
  metadata?: { trip_id?: string } | null;
  actor: {
    username: string;
    avatar_url?: string;
  };
}

export interface SocialListState {
  isOpen: boolean;
  title: string;
  users: SocialUser[];
  isLoading: boolean;
}

export interface ProfileUser {
  id?: string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  bio?: string;
  show_friends?: boolean;
  show_followers?: boolean;
}

export interface ProfileClientProps {
  user: ProfileUser;
  isPublic?: boolean;
  targetUserId: string;
  currentUserId?: string;
}
