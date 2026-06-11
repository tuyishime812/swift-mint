"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, BellOff, CheckCheck, ExternalLink, Loader2, MessageCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  type NotificationData,
  apiUnreadNotificationCount,
  apiGetNotifications,
  apiMarkNotificationRead,
  apiMarkAllNotificationsRead,
} from "@/lib/api";
import { whatsappNumber } from "@/lib/swiftmint";
import { formatDistanceToNow } from "@/lib/format";

export function NotificationBell() {
  const { token } = useAuth();
  const [unread, setUnread] = useState(0);
  const [notifs, setNotifs] = useState<NotificationData[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchUnread = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiUnreadNotificationCount(token);
      setUnread(data.count);
    } catch { /* ignore */ }
  }, [token]);

  const fetchNotifs = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await apiGetNotifications(token);
      setNotifs(data.notifications);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  useEffect(() => {
    if (open) fetchNotifs();
  }, [open, fetchNotifs]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function handleMarkRead(id: string) {
    if (!token) return;
    try {
      await apiMarkNotificationRead(token, id);
      setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      setUnread((prev) => Math.max(0, prev - 1));
    } catch { /* ignore */ }
  }

  async function handleMarkAllRead() {
    if (!token) return;
    try {
      await apiMarkAllNotificationsRead(token);
      setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnread(0);
    } catch { /* ignore */ }
  }

  function waHref(msg: string) {
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;
  }

  function messagePreview(msg: string) {
    if (msg.length <= 120) return msg;
    return msg.slice(0, 117) + "...";
  }

  return (
    <div ref={ref} className="notif-bell-wrap">
      <button className="nav-icon-btn" type="button" onClick={() => setOpen(!open)} aria-label="Notifications">
        <Bell size={18} />
        {unread > 0 ? <span className="notif-badge">{unread > 9 ? "9+" : unread}</span> : null}
      </button>

      {open ? (
        <div className="notif-dropdown">
          <div className="notif-header">
            <strong>Notifications</strong>
            {notifs.some((n) => !n.is_read) ? (
              <button className="notif-mark-all" type="button" onClick={handleMarkAllRead}>
                <CheckCheck size={14} /> Mark all read
              </button>
            ) : null}
          </div>

          <div className="notif-list">
            {loading ? (
              <div className="notif-empty"><Loader2 className="spin" size={20} /></div>
            ) : notifs.length === 0 ? (
              <div className="notif-empty">
                <BellOff size={24} />
                <span>No notifications</span>
              </div>
            ) : (
              notifs.map((n) => (
                <div key={n.id} className={`notif-item ${n.is_read ? "" : "notif-unread"}`}
                  onClick={() => !n.is_read && handleMarkRead(n.id)}>
                  <div className="notif-item-msg">
                    {n.type === "receipt" ? (
                      <a className="notif-wa-link" href={waHref(n.message)} target="_blank" rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}>
                        <MessageCircle size={13} /> View receipt on WhatsApp
                      </a>
                    ) : n.type === "status_completed" ? (
                      <a className="notif-wa-link" href={waHref(n.message)} target="_blank" rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}>
                        <MessageCircle size={13} /> Confirm on WhatsApp
                      </a>
                    ) : null}
                    <p>{messagePreview(n.message)}</p>
                  </div>
                  <div className="notif-item-meta">
                    <span>{formatDistanceToNow(n.created_at)}</span>
                    <a className="notif-wa-btn" href={waHref(n.message)} target="_blank" rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      title="Open in WhatsApp">
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
