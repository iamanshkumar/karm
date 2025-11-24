import React, { useEffect, useMemo, useState } from "react";
import { X, UserPlus, UserMinus, Search } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

const useDebounced = (value, delay = 250) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
};

const getColor = (name = "") => {
  const colors = [
    "#E6E6FF",
    "#FFEDEE",
    "#E7F7FF",
    "#E8FFF3",
    "#FFF8E7",
    "#F3E8FF",
    "#FFE8F6",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

const getInitials = (name = "") => {
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "U";
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const AssignUserPanel = ({
  open,
  onClose,
  card,
  backendUrl,
  onAssigned,
  onRemoved,
}) => {
  const [allUsers, setAllUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const debounceQuery = useDebounced(query, 200);

  useEffect(() => {
    if (!open) return;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${backendUrl}/api/user/all`);
        setAllUsers(res.data.users || []);
      } catch (error) {
        console.log(error);
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [open, backendUrl]);

  const filtered = useMemo(() => {
    if (!debounceQuery.trim()) return allUsers;

    const q = debounceQuery.toLowerCase();
    return allUsers.filter(
      (u) =>
        (u.username || u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q)
    );
  }, [allUsers, debounceQuery]);

  const handleAssign = async (userId) => {
    if (!card) return;
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/cards/${card._id}/assign`,
        { userId }
      );

      if (data.success) {
        toast.success("Assigned!");
        onAssigned && onAssigned(card._id, data.assignees);
      }
    } catch (error) {
      toast.error("Assign failed");
    }
  };

  const handleRemove = async (userId) => {
    if (!card) return;
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/cards/${card._id}/removeAssignee`,
        { userId }
      );

      if (data.success) {
        toast.success("Removed");
        onRemoved && onRemoved(card._id, data.assignees);
      }
    } catch (error) {
      toast.error("Remove failed");
    }
  };

  if (!open) return null;

  const assigneeIds = new Set((card?.assignees || []).map((a) => a._id));

  return (
    <div className="fixed inset-0 z-[99999] flex pointer-events-none">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <aside
        className="
          relative ml-auto w-full sm:w-[420px] bg-white 
          shadow-xl border-l border-gray-200 p-6 
          pointer-events-auto animate-slideLeft
        "
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-[20px] font-semibold text-gray-900">
              Assign users
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage who is assigned to this card
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <X size={20} />
          </button>
        </div>

        <div className="relative mb-5">
          <Search
            size={16}
            className="absolute left-3 top-2.5 text-gray-400"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
            className="
              w-full pl-10 pr-3 py-2.5 
              bg-gray-50 border border-gray-200 
              rounded-lg focus:outline-none 
              focus:ring-2 focus:ring-indigo-200
            "
          />
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2 tracking-wide">
            Assigned ({card?.assignees?.length || 0})
          </h4>

          {card?.assignees?.length === 0 && (
            <div className="text-sm text-gray-400 mb-4">
              No one is assigned yet.
            </div>
          )}

          <div className="space-y-2 mb-6">
            {card?.assignees?.map((u) => (
              <div
                key={u._id}
                className="
                  flex items-center justify-between 
                  p-2.5 rounded-md border border-gray-100 
                  bg-gray-50 hover:bg-gray-100 transition
                "
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium"
                    style={{ background: getColor(u.username) }}
                  >
                    {getInitials(u.username)}
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {u.username}
                    </div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                  </div>
                </div>

                <button
                  onClick={() => handleRemove(u._id)}
                  className="
                    flex items-center gap-1.5 text-sm 
                    text-red-600 hover:text-red-700 p-1.5 
                    hover:bg-red-50 rounded-md transition
                  "
                >
                  <UserMinus size={14} /> Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2 tracking-wide">
          All users
        </h4>

        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
          {loading && (
            <div className="text-sm text-gray-500">Loading users...</div>
          )}

          {!loading &&
            filtered.map((u) => (
              <div
                key={u._id}
                className="
                  flex items-center justify-between 
                  p-2.5 rounded-md hover:bg-gray-50 transition
                "
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium"
                    style={{ background: getColor(u.username) }}
                  >
                    {getInitials(u.username)}
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {u.username}
                    </div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                  </div>
                </div>

                {assigneeIds.has(u._id) ? (
                  <button
                    onClick={() => handleRemove(u._id)}
                    className="
                      flex items-center gap-1.5 text-sm 
                      text-red-600 hover:text-red-700 p-1.5 
                      hover:bg-red-50 rounded-md transition
                    "
                  >
                    <UserMinus size={14} /> Remove
                  </button>
                ) : (
                  <button
                    onClick={() => handleAssign(u._id)}
                    className="
                      flex items-center gap-1.5 px-3 py-1.5 
                      bg-indigo-600 text-white text-sm 
                      rounded-md hover:bg-indigo-700 transition
                    "
                  >
                    <UserPlus size={14} /> Assign
                  </button>
                )}
              </div>
            ))}

          {!loading && filtered.length === 0 && (
            <div className="text-sm text-gray-400">No users found</div>
          )}
        </div>
      </aside>
    </div>
  );
};

export default AssignUserPanel;