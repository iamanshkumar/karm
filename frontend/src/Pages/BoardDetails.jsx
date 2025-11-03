import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AppContext from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { Plus } from "lucide-react";
import Navbar from "../components/Navbar";

const BoardDetails = () => {
  const { boardId } = useParams();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const { backendUrl } = useContext(AppContext);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/boards`);
        const selectedBoard = res.data.boards.find((b) => b._id === boardId);

        if (!selectedBoard) toast.error("Board not found");
        setBoard(selectedBoard);
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBoard();
  }, [boardId]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/60 backdrop-blur-2xl">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 pt-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-gray-900 tracking-tight">
            {board.title}
          </h1>
          {board.description && (
            <p className="text-gray-600 mt-2 text-base">{board.description}</p>
          )}
          <p className="text-sm text-gray-400 mt-2">
            Created by{" "}
            <span className="text-gray-700 font-medium">
              {board.createdBy?.username || "Unknown"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BoardDetails;
