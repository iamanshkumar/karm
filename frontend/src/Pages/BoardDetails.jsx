import React, { useCallback, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AppContext from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Plus,
  Trash2,
  Edit3,
  X,
  MessageSquare,
  Clock,
  MoreHorizontal,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

/**
 * Small UI components
 */

// Tab button - sharper, compact
const TabButton = ({ active, onClick, icon, children }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition ${
      active
        ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
        : "text-gray-600 hover:bg-gray-50"
    }`}
  >
    {icon}
    <span className="font-medium">{children}</span>
  </button>
);

// Crisp modal: light, slightly elevated, subtle border
const Modal = ({ onClose, title, children, size = "md" }) => {
  const maxw = size === "lg" ? "max-w-4xl" : "max-w-lg";
  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-black/30">
      <div
        className={`bg-white ${maxw} w-full rounded-lg shadow-lg border border-gray-100 p-6 relative`}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
};

/**
 * BoardDetails Page
 */
const BoardDetails = () => {
  const { boardId } = useParams();
  const { backendUrl, user } = useContext(AppContext);

  // state
  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [cardsByList, setCardsByList] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingCards, setLoadingCards] = useState(false);

  // list create
  const [showListModal, setShowListModal] = useState(false);
  const [listTitle, setListTitle] = useState("");
  const [creatingList, setCreatingList] = useState(false);

  // card create
  const [showCardModal, setShowCardModal] = useState(false);
  const [activeListId, setActiveListId] = useState(null);
  const [cardTitle, setCardTitle] = useState("");
  const [cardDescription, setCardDescription] = useState("");
  const [creatingCard, setCreatingCard] = useState(false);

  // card details
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // tabs (details | comments | activity)
  const [tab, setTab] = useState("details");
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [activity, setActivity] = useState([]);

  const [editingCommentId , setEditingCommentId] = useState(null);
  const [editCommentText , setEditCommentText] = useState("");

  const [allUsers , setAllUsers] = useState([]);
  const [showAssignDropdown , setShowAssignDropdown] = useState(false);

  // fetch board + lists
  const fetchCardsForLists = useCallback(
    async (listsArray) => {
      if (!Array.isArray(listsArray) || listsArray.length === 0) {
        setCardsByList({});
        return;
      }
      setLoadingCards(true);
      try {
        const promises = listsArray.map((l) =>
          axios.get(`${backendUrl}/api/cards/lists/${l._id}`)
        );
        const results = await Promise.all(promises);
        const map = {};
        results.forEach((res, i) => {
          const listId = listsArray[i]._id;
          const cards = Array.isArray(res.data) ? res.data : res.data.cards || [];
          map[listId] = cards.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
        });
        setCardsByList(map);
      } catch (err) {
        console.error("fetchCardsForLists error:", err);
        toast.error("Failed to load cards");
      } finally {
        setLoadingCards(false);
      }
    },
    [backendUrl]
  );

  const fetchBoardAndLists = useCallback(async () => {
    setLoading(true);
    try {
      const boardRes = await axios.get(`${backendUrl}/api/boards`);
      const selectedBoard = boardRes.data.boards?.find((b) => b._id === boardId);
      if (!selectedBoard) {
        toast.error("Board not found");
        setLoading(false);
        return;
      }
      setBoard(selectedBoard);

      const listRes = await axios.get(`${backendUrl}/api/lists/boards/${boardId}`);
      const fetchedLists = Array.isArray(listRes.data) ? listRes.data : listRes.data.lists || [];
      setLists(fetchedLists);
      await fetchCardsForLists(fetchedLists);
    } catch (err) {
      console.error("fetchBoardAndLists error:", err);
      toast.error("Failed to load board");
    } finally {
      setLoading(false);
    }
  }, [backendUrl, boardId, fetchCardsForLists]);

  useEffect(() => {
    const fetchUsers = async()=>{
      const {data} = await axios.get(`${backendUrl}/api/users`);
      setAllUsers(data.users);
    }

    fetchUsers(),
    fetchBoardAndLists();
  }, [fetchBoardAndLists]);

  // helpers
  const isOwner = board?.createdBy?._id === user?._id;
  const findCardListId = (cardId) =>
    Object.keys(cardsByList).find((lid) => cardsByList[lid]?.some((c) => c._id === cardId));

  // CREATE LIST
  const handleCreateList = async (e) => {
    e?.preventDefault();
    if (!listTitle.trim()) return toast.error("List title required");
    setCreatingList(true);
    try {
      const { data } = await axios.post(`${backendUrl}/api/lists/boards/${boardId}`, {
        title: listTitle.trim(),
      });
      if (data.success && data.list) {
        setLists((p) => [...p, data.list]);
        setCardsByList((p) => ({ ...p, [data.list._id]: [] }));
        setShowListModal(false);
        setListTitle("");
        toast.success("List created");
      } else {
        toast.error(data.message || "Could not create list");
      }
    } catch (err) {
      console.error("create list error:", err);
      toast.error("Server error creating list");
    } finally {
      setCreatingList(false);
    }
  };

  // DELETE LIST
  const handleDeleteList = async (listId) => {
    if (!window.confirm("Delete this list and all its cards?")) return;
    try {
      const { data } = await axios.delete(`${backendUrl}/api/lists/${listId}`);
      if (data.success) {
        setLists((p) => p.filter((l) => l._id !== listId));
        setCardsByList((p) => {
          const copy = { ...p };
          delete copy[listId];
          return copy;
        });
        toast.success("List deleted");
      } else {
        toast.error(data.message || "Failed to delete list");
      }
    } catch (err) {
      console.error("delete list error:", err);
      toast.error("Failed to delete list");
    }
  };

  // CREATE CARD
  const handleCreateCard = async (e) => {
    e?.preventDefault();
    if (!cardTitle.trim()) return toast.error("Card title required");
    setCreatingCard(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/cards/lists/${activeListId}`,
        { title: cardTitle.trim(), description: cardDescription }
      );
      if (data.success && data.card) {
        setCardsByList((p) => ({ ...p, [activeListId]: [...(p[activeListId] || []), data.card] }));
        setShowCardModal(false);
        setCardTitle("");
        setCardDescription("");
        setActiveListId(null);
        toast.success("Card created");
      } else {
        toast.error(data.message || "Failed to create card");
      }
    } catch (err) {
      console.error("create card error:", err);
      toast.error("Server error creating card");
    } finally {
      setCreatingCard(false);
    }
  };

  // DELETE CARD
  const handleDeleteCard = async (cardId, listId) => {
    if (!window.confirm("Delete this card?")) return;
    try {
      const { data } = await axios.delete(`${backendUrl}/api/cards/${cardId}`);
      if (data.success) {
        setCardsByList((p) => ({ ...p, [listId]: (p[listId] || []).filter((c) => c._id !== cardId) }));
        if (activeCard?._id === cardId) {
          setShowCardDetails(false);
          setActiveCard(null);
        }
        toast.success("Card deleted");
      } else {
        toast.error(data.message || "Failed to delete card");
      }
    } catch (err) {
      console.error("delete card error:", err);
      toast.error("Failed to delete card");
    }
  };

  // EDIT CARD
  const handleEditCard = async (e) => {
    e?.preventDefault();
    if (!activeCard) return;
    try {
      const { data } = await axios.put(`${backendUrl}/api/cards/${activeCard._id}`, {
        title: editTitle,
        description: editDescription,
      });
      if (data.success) {
        setCardsByList((prev) => {
          const copy = { ...prev };
          Object.keys(copy).forEach((lid) => {
            copy[lid] = copy[lid].map((c) =>
              c._id === activeCard._id ? { ...c, title: editTitle, description: editDescription } : c
            );
          });
          return copy;
        });
        setActiveCard((c) => ({ ...c, title: editTitle, description: editDescription }));
        setEditing(false);
        await loadActivity(activeCard._id);
        toast.success("Card updated");
      } else {
        toast.error(data.message || "Failed to update card");
      }
    } catch (err) {
      console.error("edit card error:", err);
      toast.error("Error updating card");
    }
  };

  // MOVE CARD (drag)
  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const prev = JSON.parse(JSON.stringify(cardsByList));
    try {
      const newState = { ...cardsByList };
      const sourceArr = [...(newState[source.droppableId] || [])];
      const destArr = [...(newState[destination.droppableId] || [])];

      const idx = sourceArr.findIndex((c) => c._id === draggableId);
      if (idx === -1) {
        console.error("Card not found in source");
        return;
      }
      const [moved] = sourceArr.splice(idx, 1);
      const movedUpdated = { ...moved, listID: destination.droppableId };
      destArr.splice(destination.index, 0, movedUpdated);

      newState[source.droppableId] = sourceArr;
      newState[destination.droppableId] = destArr;
      setCardsByList(newState);

      const resp = await axios.put(`${backendUrl}/api/cards/${draggableId}/move`, {
        listID: destination.droppableId,
        position: destination.index,
      });

      if (!resp.data.success) {
        throw new Error(resp.data.message || "Move failed");
      } else {
        toast.success("Card moved");
        // merge backend response if any
        if (resp.data.card) {
          setCardsByList((prevState) => {
            const copy = { ...prevState };
            if (copy[destination.droppableId]) {
              copy[destination.droppableId] = copy[destination.droppableId].map((c) =>
                c._id === draggableId ? { ...c, ...resp.data.card } : c
              );
            }
            return copy;
          });
        }
      }
    } catch (err) {
      console.error("drag error:", err);
      setCardsByList(prev);
      toast.error("Failed to move card");
    }
  };

  // Comments + Activity loaders
  const loadComments = async (cardId) => {
    try {
      const res = await axios.get(`${backendUrl}/api/cards/${cardId}/comments`);
      const payload = res.data;
      // backend might return array or {comments: [...]}
      setComments(Array.isArray(payload) ? payload : payload.comments || []);
    } catch (err) {
      console.error("loadComments err:", err);
      toast.error("Failed to load comments");
    }
  };

  const loadActivity = async (cardId) => {
    try {
      const res = await axios.get(`${backendUrl}/api/cards/${cardId}/activity`);
      const payload = res.data;
      setActivity(Array.isArray(payload) ? payload : payload.activity || []);
    } catch (err) {
      console.error("loadActivity err:", err);
      toast.error("Failed to load activity");
    }
  };

  // Open card detail modal
  const openCardDetails = async (card) => {
    setActiveCard(card);
    setEditTitle(card.title || "");
    setEditDescription(card.description || "");
    setShowCardDetails(true);
    setTab("details");
    await loadComments(card._id);
    await loadActivity(card._id);
  };

  // Add comment
  const handleAddComment = async (e) => {
    e?.preventDefault();
    if (!activeCard) return toast.error("No active card");
    if (!newComment.trim()) return toast.error("Comment empty");
    try {
      const { data } = await axios.post(`${backendUrl}/api/cards/${activeCard._id}/comments`, {
        text: newComment.trim(),
      });
      if (data.success) {
        setComments((p) => [...p, data.comment]);
        setNewComment("");
        await loadActivity(activeCard._id);
        toast.success("Comment added");
      } else {
        toast.error(data.message || "Failed to add comment");
      }
    } catch (err) {
      console.error("add comment err:", err);
      toast.error("Failed to add comment");
    }
  };

  // Assign user (example helper) - kept minimal for now
  const handleAssignUser = async (cardId, userId) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/cards/${cardId}/assign`, {
        userId,
      });

      if (data.success) {
        toast.success("Assigned!");
        setActiveCard((prev) => ({ ...prev, assignees: data.assignees }));

        setCardsByList((prev) => {
          const copy = { ...prev };
          Object.keys(copy).forEach((lid) => {
            copy[lid] = copy[lid].map((c) =>
              c._id === cardId ? { ...c, assignees: data.assignees } : c
            );
          });
          return copy;
        });

        setShowAssignDropdown(false);
      }
    } catch {
      toast.error("Assign failed");
    }
  };

  const handleRemoveAssignee = async(cardId , userId)=>{
    try{
      const {data} = await axios.post(`${backendUrl}/api/cards/${cardId}/removeAssignee` , {userId});

      if(data.success){
        toast.success("Removed")
        setActiveCard((prev)=>({...prev , assignees : data.assignees}))

        setCardsByList((prev)=>{
          const copy = {...prev};
          Object.keys(copy).forEach((lid)=>{
            copy[lid] = copy[lid].map((c)=>c._id === cardId ? {...c , assignees : data.assignees} : c)
          })
          return copy;
        })  
      }
    }catch{
      toast.error("Removed failed")
    }
  }


  const handleEditComment = async (cardId , commentId) =>{
    if(!editCommentText.trim()){
      return toast.error("Comment cannot be empty")
    }

    try{
      const {data} = await axios.put(`${backendUrl}/api/cards/${cardId}/comments/${commentId}` ,
        {text : editCommentText.trim()}
      )

      if(data.success){
        setComments((prev)=>{
          return prev.map((c)=>c._id === commentId ? {...c , text : editCommentText.trim() , updatedAt : new Date()} : c)
        })

        setEditingCommentId(null);
        setEditCommentText("")
        toast.success("Comment updated")
      }else{
        toast.success(data.message || "Failed to update comment")
      }
    }catch(error){
      toast.error(error.message)
    }
  }

  const handleDeleteComment = async (cardId , commentId)=>{
    if(!window.confirm("Delete this comment?")){
      return;
    }

    try{
      const {data} = await axios.delete(`${backendUrl}/api/cards/${cardId}/comments/${commentId}`)
      if(data.success){
        setComments((prev)=>prev.filter((c)=>c._id !== commentId))
        toast.success("Comment deleted")
      }else{
        toast.error(data.message || "Failed to delete comment")
      }
    }catch(error){
      toast.error("Failed to delete comment")
    }

  }

  // UI: Loading
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-indigo-600">
        Loading board...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{board?.title}</h1>
            {board?.description && <p className="text-sm text-gray-600 mt-1">{board.description}</p>}
          </div>

          {isOwner && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowListModal(true)}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-indigo-700 transition"
              >
                <Plus size={16} />
                Add list
              </button>
              <button
                onClick={fetchBoardAndLists}
                className="inline-flex items-center gap-2 border border-gray-200 px-3 py-2 rounded-md text-sm hover:bg-gray-50"
              >
                Refresh
              </button>
            </div>
          )}
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex space-x-5 overflow-x-auto pb-6" style={{ scrollbarWidth: "thin" }}>
            {lists.map((list) => (
              <Droppable droppableId={list._id} key={list._id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`w-72 flex-shrink-0 bg-white rounded-md border border-gray-100 shadow-sm p-3 transition ${
                      snapshot.isDraggingOver ? "ring-1 ring-indigo-200" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">{list.title}</h3>
                        <div className="text-xs text-gray-500 mt-0.5">{(cardsByList[list._id]?.length || 0) + " cards"}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeleteList(list._id)}
                          className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50"
                          title="Delete list"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setActiveListId(list._id);
                            setShowCardModal(true);
                          }}
                          className="text-indigo-600 text-sm font-medium px-2 py-1 rounded hover:bg-indigo-50"
                        >
                          + Add
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 min-h-[40px]">
                      {(cardsByList[list._id] || []).map((card, index) => (
                        <Draggable key={card._id} draggableId={card._id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => openCardDetails(card)}
                              className={`group bg-white border border-gray-100 rounded-md p-3 cursor-pointer hover:shadow-md transition flex items-start gap-3 ${
                                snapshot.isDragging ? "opacity-90 scale-[0.995]" : ""
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-3">
                                  <h4 className="text-sm font-medium text-gray-800 truncate">{card.title}</h4>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const listId = list._id;
                                      handleDeleteCard(card._id, listId);
                                    }}
                                    className="text-gray-400 hidden group-hover:inline-flex p-1 rounded hover:bg-red-50"
                                    title="Delete card"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                                {card.description && (
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{card.description}</p>
                                )}
                                <div className="mt-2 flex items-center gap-2">
                                  {card.assignees?.length > 0 && (
                                    <div className="text-xs text-gray-500">{card.assignees.length} assignee(s)</div>
                                  )}
                                  <div className="text-xs text-gray-400">•</div>
                                  <div className="text-xs text-gray-400">{card.createdBy?.username || "—"}</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
            {/* Empty-state column to hint "Add list" */}
            <div className="w-72 flex-shrink-0 flex items-center">
              <button
                onClick={() => setShowListModal(true)}
                className="w-full border-dashed border border-gray-200 rounded-md p-4 text-sm text-gray-500 hover:bg-gray-50"
              >
                + Create new list
              </button>
            </div>
          </div>
        </DragDropContext>
      </div>

      {/* Modals */}
      {showListModal && (
        <Modal onClose={() => setShowListModal(false)} title="Create list">
          <form onSubmit={handleCreateList}>
            <input
              value={listTitle}
              onChange={(e) => setListTitle(e.target.value)}
              autoFocus
              placeholder="List title"
              className="w-full border border-gray-200 rounded-md p-3 mb-3 focus:outline-none focus:ring-1 focus:ring-indigo-200"
            />
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={creatingList}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {creatingList ? "Creating..." : "Create"}
              </button>
              <button
                type="button"
                onClick={() => setShowListModal(false)}
                className="flex-1 border border-gray-200 py-2 rounded-md"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showCardModal && (
        <Modal onClose={() => setShowCardModal(false)} title="Create card">
          <form onSubmit={handleCreateCard}>
            <input
              value={cardTitle}
              onChange={(e) => setCardTitle(e.target.value)}
              autoFocus
              placeholder="Card title"
              className="w-full border border-gray-200 rounded-md p-3 mb-3 focus:outline-none focus:ring-1 focus:ring-indigo-200"
            />
            <textarea
              value={cardDescription}
              onChange={(e) => setCardDescription(e.target.value)}
              rows={4}
              placeholder="Description (optional)"
              className="w-full border border-gray-200 rounded-md p-3 mb-3 focus:outline-none focus:ring-1 focus:ring-indigo-200 resize-none"
            />
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={creatingCard}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {creatingCard ? "Creating..." : "Create"}
              </button>
              <button type="button" onClick={() => setShowCardModal(false)} className="flex-1 border border-gray-200 py-2 rounded-md">
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showCardDetails && activeCard && (
        <Modal onClose={() => setShowCardDetails(false)} title={editing ? "Edit card" : activeCard.title} size="lg">
          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <TabButton active={tab === "details"} onClick={() => setTab("details")} icon={<Edit3 size={14} />}>
              Details
            </TabButton>
            <TabButton active={tab === "comments"} onClick={() => setTab("comments")} icon={<MessageSquare size={14} />}>
              Comments
            </TabButton>
            <TabButton active={tab === "activity"} onClick={() => setTab("activity")} icon={<Clock size={14} />}>
              Activity
            </TabButton>
            <div className="ml-auto">
              <button
                className="inline-flex items-center gap-2 px-2 py-1 rounded-md border border-gray-100 hover:bg-gray-50 text-sm text-gray-600"
                onClick={() => toast.info("More actions coming")}
                title="More"
              >
                <MoreHorizontal size={14} />
              </button>
            </div>
          </div>

          {/* Tab panels */}
          {tab === "details" && !editing && (
            <>
              <p className="text-sm text-gray-700 mb-4 whitespace-pre-wrap">{activeCard.description || "No description"}</p>

              <div className="flex gap-3">
                {isOwner && (
                  <>
                    <button
                      onClick={() => setEditing(true)}
                      className="py-2.5 px-4 border border-gray-200 rounded-md text-sm hover:bg-gray-50"
                    >
                      <Edit3 size={14} className="inline-block mr-2" /> Edit
                    </button>
                    <button
                      onClick={() => {
                        const lid = findCardListId(activeCard._id);
                        if (lid) handleDeleteCard(activeCard._id, lid);
                        else toast.error("List not found");
                      }}
                      className="py-2.5 px-4 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
                    >
                      <Trash2 size={14} className="inline-block mr-2" /> Delete
                    </button>
                  </>
                )}
              </div>
            </>
          )}

          {tab === "details" && editing && (
            <form onSubmit={handleEditCard}>
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full border border-gray-200 rounded-md p-3 mb-3 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                required
                autoFocus
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={6}
                className="w-full border border-gray-200 rounded-md p-3 mb-3 focus:outline-none focus:ring-1 focus:ring-indigo-200 resize-none"
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setEditing(false)} className="flex-1 border border-gray-200 py-2 rounded-md">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700">
                  Save
                </button>
              </div>
            </form>
          )}

          {tab === "comments" && (
  <>
    <div className="max-h-64 overflow-y-auto mb-3 space-y-3">
      {comments.length === 0 && <div className="text-sm text-gray-400 text-center py-6">No comments yet</div>}
      {comments.map((c) => (
        <div key={c._id || Math.random()} className="border border-gray-100 rounded-md p-3 bg-gray-50 group">
          {editingCommentId === c._id ? (
            <form onSubmit={(e) => { e.preventDefault(); handleEditComment(activeCard._id, c._id); }}>
              <textarea
                value={editCommentText}
                onChange={(e) => setEditCommentText(e.target.value)}
                rows={3}
                className="w-full border border-gray-200 rounded-md p-2 mb-2 focus:outline-none focus:ring-1 focus:ring-indigo-200 resize-none"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-1 px-2 rounded text-sm hover:bg-indigo-700"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingCommentId(null);
                    setEditCommentText("");
                  }}
                  className="flex-1 border border-gray-200 py-1 px-2 rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex items-center justify-between mb-1">
                <div className="text-sm font-medium text-gray-800">{c.author?.username || "User"}</div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-gray-400">
                    {new Date(c.createdAt || Date.now()).toLocaleString()}
                    {c.updatedAt && c.updatedAt !== c.createdAt && " (edited)"}
                  </div>
                  {c.author?._id === user?._id && (
                    <div className="hidden group-hover:flex gap-1">
                      <button
                        onClick={() => {
                          setEditingCommentId(c._id);
                          setEditCommentText(c.text);
                        }}
                        className="text-indigo-600 hover:text-indigo-700 text-xs px-2 py-1 rounded hover:bg-indigo-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteComment(activeCard._id, c._id)}
                        className="text-red-600 hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">{c.text}</div>
            </>
          )}
        </div>
      ))}
    </div>

    <form onSubmit={handleAddComment}>
      <textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        rows={3}
        placeholder="Write a comment..."
        className="w-full border border-gray-200 rounded-md p-3 mb-3 focus:outline-none focus:ring-1 focus:ring-indigo-200 resize-none"
      />
      <div className="flex gap-3">
        <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700">
          Add comment
        </button>
        <button type="button" onClick={() => setNewComment("")} className="flex-1 border border-gray-200 py-2 rounded-md">
          Clear
        </button>
      </div>
    </form>
  </>
)}

          {tab === "activity" && (
            <>
              <div className="max-h-72 overflow-y-auto space-y-3">
                {activity.length === 0 && <div className="text-sm text-gray-400 text-center py-6">No activity yet</div>}
                {activity.map((a) => (
                  <div key={a._id || a.id || Math.random()} className="flex items-start gap-3 border border-gray-100 rounded-md p-3 bg-gray-50">
                    <div className="text-sm font-medium text-gray-800">{a.user?.username || a.user?.name || "User"}</div>
                    <div className="text-sm text-gray-700">{a.message || (a.type ? `${a.type} performed` : "Activity")}</div>
                    <div className="ml-auto text-xs text-gray-400">{new Date(a.createdAt || a.created_at || Date.now()).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  );
};

export default BoardDetails;
