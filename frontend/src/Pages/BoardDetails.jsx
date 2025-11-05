import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AppContext from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { Plus, X } from "lucide-react";
import Navbar from "../components/Navbar";

const BoardDetails = () => {
  const { boardId } = useParams();
  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showListModal, setShowListModal] = useState(false);
  const [listTitle, setListTitle] = useState("");
  const [creatingList, setCreatingList] = useState(false);
  const { backendUrl, user } = useContext(AppContext);

  useEffect(() => {
    const fetchBoardAndLists = async () => {
      try {
        const boardRes = await axios.get(`${backendUrl}/api/boards`);
        const selectedBoard = boardRes.data.boards.find((b) => b._id === boardId);
        if (!selectedBoard) {
          toast.error("Board not found");
        } else {
          setBoard(selectedBoard);
        }

        const listRes = await axios.get(`${backendUrl}/api/lists/boards/${boardId}`);
        setLists(listRes.data);
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBoardAndLists();
  }, [boardId, backendUrl]);

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!listTitle.trim()) {
      toast.error("List title is required");
      return;
    }
    try {
      setCreatingList(true);
      const { data } = await axios.post(`${backendUrl}/api/lists/boards/${boardId}`, {
        title: listTitle,
        boardId,
      });
      if (data.success) {
        const safeList = { ...data.list, cards: data.list.cards || [] };
        setLists((prev) => [...prev, safeList]);
        setListTitle("");
        setShowListModal(false);
        window.dispatchEvent(new Event("boardsUpdated"));
      } else {
        toast.error(data.message || "Failed to create list");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create list");
    } finally {
      setCreatingList(false);
    }
  };

  const handleDeleteList = async (listId) => {
    if (window.confirm("Delete this list?")) {
      try {
        const { data } = await axios.delete(`${backendUrl}/api/lists/${listId}`);
        if (data.success) {
          toast.success("List deleted!");
          setLists(lists.filter((list) => list._id !== listId));
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete list");
      }
    }
  };

  if (loading)
    return (
      <p className="flex justify-center items-center h-screen text-xl text-indigo-600 font-medium">
        Loading board...
      </p>
    );

  if (!board)
    return (
      <p className="flex justify-center items-center h-screen text-gray-500">
        Board doesn’t exist
      </p>
    );

  const isOwner = board.createdBy?._id === user?._id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100/70 backdrop-blur-xl">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-4xl font-semibold text-gray-900 tracking-tight">
              {board.title}
            </h1>
            {board.description && (
              <p className="text-gray-600 mt-2 text-sm leading-relaxed max-w-lg">
                {board.description}
              </p>
            )}
            <p className="mt-3 text-gray-500 text-sm">
              Created by{" "}
              <span className="text-gray-800 font-medium">
                {board.createdBy?.username || "Unknown"}
              </span>
            </p>
          </div>

          {isOwner && (
            <button
              onClick={() => setShowListModal(true)}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all"
            >
              <Plus size={18} />
              Add List
            </button>
          )}
        </div>

        {/* Lists */}
        <div className="mt-6">
          {lists.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-gray-200 shadow-md p-12 text-center">
                <Plus size={42} className="mx-auto text-indigo-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  {isOwner ? "Create your first list" : "No lists yet"}
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                  {isOwner
                    ? "Start organizing tasks by creating lists"
                    : "The board owner hasn't created any list yet"}
                </p>
                {isOwner && (
                  <button
                    onClick={() => setShowListModal(true)}
                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition"
                  >
                    Add List
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lists.map((list) => (
                <div
                  key={list._id}
                  className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-6"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {list.title}
                    </h3>
                    {isOwner && (
                      <button
                        onClick={() => handleDeleteList(list._id)}
                        className="text-gray-400 hover:text-red-500 transition"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>

                  <div className="text-sm text-gray-500 mb-4">
                    {list.cards?.length || 0} cards
                  </div>

                  <button
                    onClick={() => toast.info("Add card feature coming soon")}
                    className="w-full text-left text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    + Add card
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showListModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Create a new list
            </h2>

            <form onSubmit={handleCreateList}>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  List Title
                </label>
                <input
                  type="text"
                  value={listTitle}
                  onChange={(e) => setListTitle(e.target.value)}
                  placeholder="e.g., To Do, In Progress, Done"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  required
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowListModal(false);
                    setListTitle("");
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creatingList}
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition"
                >
                  {creatingList ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardDetails;
