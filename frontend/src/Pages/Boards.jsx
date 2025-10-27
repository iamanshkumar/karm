import React, { useContext, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import AppContext from "../context/AppContext.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Boards = () => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [boardTitle, setBoardTitle] = useState("");
  const [boardDescription, setBoardDescription] = useState("");
  const [hoveredCard, setHoveredCard] = useState(null);

  const { backendUrl, user } = useContext(AppContext);
  const navigate = useNavigate();

  // Fetch all boards
  const fetchBoards = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/boards`);
      if (response.data.success) {
        setBoards(response.data.boards);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch boards");
    } finally {
      setLoading(false);
    }
  };

  // Create a new board
  const handleCreateBoard = async (e) => {
    e.preventDefault();

    if (!boardTitle.trim()) {
      toast.error("Board title is required");
      return;
    }

    try {
      const response = await axios.post(`${backendUrl}/api/boards`, {
        title: boardTitle,
        description: boardDescription,
      });

      if (response.data.success) {
        toast.success("Board created");
        // ✅ Re-fetch for fully populated createdBy
        await fetchBoards();
        setBoardTitle("");
        setBoardDescription("");
        setShowModal(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create board");
    }
  };

  // Delete board
  const handleDeleteBoard = async (boardId) => {
    if (window.confirm("Delete this board ?")) {
      try {
        const { data } = await axios.delete(`${backendUrl}/api/boards/${boardId}`);
        if (data.success) {
          toast.success("Board deleted successfully");
          setBoards(boards.filter((board) => board._id !== boardId));
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete the board");
      }
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  // Split boards into mine and others
  const myBoards = boards.filter((board) => board.createdBy?._id === user?._id);
  const otherBoards = boards.filter((board) => board.createdBy?._id !== user?._id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar onCreateBoard={() => setShowModal(true)} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* My Boards */}
        <div className="mb-10">
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 mb-2">
            My Boards
          </h2>
          <p className="text-gray-600 mb-6">Your workspace at a glance</p>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Loading Boards...</p>
            </div>
          ) : myBoards.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <button
                onClick={() => setShowModal(true)}
                className="group relative flex flex-col items-center justify-center w-full max-w-md h-64 bg-white border-2 border-dashed border-gray-300 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50/30 transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-8 h-8 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Create your first board
                </h3>
                <p className="text-gray-600 text-sm">
                  Get started by creating a new workspace
                </p>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {myBoards.map((board) => (
                <div
                  key={board._id}
                  onMouseEnter={() => setHoveredCard(board._id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => navigate(`/board/${board._id}`)}
                  className="group relative bg-white rounded-xl border border-gray-200/70 shadow-sm hover:shadow-md hover:-translate-y-[2px] transition-all duration-200 cursor-pointer p-6"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteBoard(board._id);
                    }}
                    className={`absolute top-4 right-4 p-2 rounded-lg hover:bg-red-50 transition-all duration-150 ${
                      hoveredCard === board._id ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <svg
                      className="w-4 h-4 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>

                  <div className="pr-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                      {board.title}
                    </h3>
                  </div>

                  {board.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {board.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 10h16M4 14h16M4 18h16"
                      />
                    </svg>
                    <span>{board.lists?.length || 0} Lists</span>
                  </div>

                  {board.createdBy?.username && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-3">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5.121 17.804A4 4 0 018 16h8a4 4 0 012.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>Created by {board.createdBy.username}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Other Boards */}
        {otherBoards.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Other Boards
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {otherBoards.map((board) => (
                <div
                  key={board._id}
                  onClick={() => navigate(`/board/${board._id}`)}
                  className="bg-white rounded-xl border border-gray-200/70 shadow-sm hover:shadow-md hover:-translate-y-[2px] transition-all duration-200 cursor-pointer p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                    {board.title}
                  </h3>
                  {board.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {board.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 10h16M4 14h16M4 18h16"
                      />
                    </svg>
                    <span>{board.lists?.length || 0} Lists</span>
                  </div>
                  {board.createdBy?.username && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-3">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5.121 17.804A4 4 0 018 16h8a4 4 0 012.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>Created by {board.createdBy.username}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Create new board
            </h2>
            <form onSubmit={handleCreateBoard} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Board Title
                </label>
                <input
                  type="text"
                  value={boardTitle}
                  onChange={(e) => setBoardTitle(e.target.value)}
                  placeholder="e.g., Product Roadmap"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-150 outline-none"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={boardDescription}
                  onChange={(e) => setBoardDescription(e.target.value)}
                  placeholder="What's this board about?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-150 outline-none resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setBoardTitle("");
                    setBoardDescription("");
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-150"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-150"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Boards;
