// src/utils/facultyNav.js
/**
 * Helper builders for faculty sidebar navigation.
 * Each item is normalized to include the click handler and active state.
 */

const withNavigate = (navigate, item, activeKey) => ({
  ...item,
  active: item.key === activeKey || Boolean(item.active),
  onClick: item.onClick || (() => navigate(item.path)),
});

export const getDefaultFacultyNavItems = (navigate, activeKey, extraItems = []) => {
  const baseItems = [
    { key: "dashboard", label: "Dashboard", path: "/faculty" },
    { key: "my-submissions", label: "My Submissions", path: "/faculty-submissions" },
    { key: "new-submission", label: "New Submission", path: "/new-submission" },
    { key: "drafts", label: "Drafts", path: "/faculty-drafts" },
    { key: "ai-upload", label: "AI Upload", path: "/ai-upload" },
    { key: "events", label: "Upcoming Events", path: "/events" },
    ...extraItems,
  ];

  return baseItems.map((item) => withNavigate(navigate, item, activeKey));
};

export const getProfileNavItem = (navigate, isActive = false) =>
  withNavigate(
    navigate,
    { key: "profile", label: "Profile", path: "/profile", active: isActive },
    isActive ? "profile" : undefined
  );

export const getHelpNavItem = (navigate) =>
  withNavigate(navigate, { key: "help", label: "Help & Support", path: "/help" });

