import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AppContext from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { Plus, Trash2, Edit3, X } from "lucide-react";
import Navbar from "../components/Navbar";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

const BoardDetails = () => {
  const { boardId } = useParams();
  const { backendUrl, user } = useContext(AppContext);

  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  // List management
  const [showListModal, setShowListModal] = useState(false);
  const [listTitle, setListTitle] = useState("");
  const [creatingList, setCreatingList] = useState(false);

  // Card management
  const [cardsByList, setCardsByList] = useState({});
  const [loadingCards, setLoadingCards] = useState(false);

  // Create Card
  const [showCardModal, setShowCardModal] = useState(false);
  const [activeListId, setActiveListId] = useState(null);
  const [cardTitle, setCardTitle] = useState("");
  const [cardDescription, setCardDescription] = useState("");
  const [creatingCard, setCreatingCard] = useState(false);

  // Card Details & Editing
  const [activeCard, setActiveCard] = useState(null);
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editing, setEditing] = useState(false);

  // --- FETCH BOARD AND LISTS ---
  useEffect(() => {
    const fetchBoardAndLists = async () => {
      try {
        const boardRes = await axios.get(`${backendUrl}/api/boards`);
        const selectedBoard = boardRes.data.boards.find((b) => b._id === boardId);
        if (!selectedBoard) {
          toast.error("Board not found");
          return;
        }
        setBoard(selectedBoard);

        const listRes = await axios.get(`${backendUrl}/api/lists/boards/${boardId}`);
        const fetchedLists = listRes.data;
        setLists(fetchedLists);
        
        // Fetch cards after lists are set
        if (fetchedLists && fetchedLists.length > 0) {
          await fetchCardsForLists(fetchedLists);
        }
      } catch (error) {
        toast.error("Failed to load board");
      } finally {
        setLoading(false);
      }
    };
    fetchBoardAndLists();
  }, [boardId, backendUrl]);

  // --- FETCH CARDS ---
  const fetchCardsForLists = async (listsArray) => {
    if (!Array.isArray(listsArray) || listsArray.length === 0) return;
    setLoadingCards(true);
    try {
      const promises = listsArray.map((l) =>
        axios.get(`${backendUrl}/api/cards/lists/${l._id}`)
      );
      const results = await Promise.all(promises);
      const map = {};
      results.forEach((res, i) => {
        // Sort cards by position if available
        const cards = Array.isArray(res.data) ? res.data : [];
        const listId = listsArray[i]._id;
        
        // Filter cards to ensure they belong to this list (in case backend returns wrong data)
        const filteredCards = cards.filter(card => 
          !card.listID || card.listID === listId
        );
        
        map[listId] = filteredCards.sort((a, b) => 
          (a.position || 0) - (b.position || 0)
        );
      });
      setCardsByList(map);
      console.log("Fetched cards by list:", map); // Debug log
    } catch (error) {
      console.error("Error fetching cards:", error);
      toast.error("Failed to load cards");
    } finally {
      setLoadingCards(false);
    }
  };

  // --- HELPER: Find which list a card belongs to ---
  const findCardListId = (cardId) => {
    return Object.keys(cardsByList).find(listId =>
      cardsByList[listId].some(card => card._id === cardId)
    );
  };

  // --- CREATE LIST ---
  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!listTitle.trim()) return toast.error("List title required");

    try {
      setCreatingList(true);
      const { data } = await axios.post(`${backendUrl}/api/lists/boards/${boardId}`, {
        title: listTitle,
      });

      if (data.success && data.list) {
        setLists((prev) => [...prev, data.list]);
        setCardsByList((prev) => ({ ...prev, [data.list._id]: [] }));
        setShowListModal(false);
        setListTitle("");
        toast.success("List created!");
      } else {
        toast.error(data.message || "Failed to create list");
      }
    } catch (err) {
      toast.error("Server error creating list");
    } finally {
      setCreatingList(false);
    }
  };

  // --- DELETE LIST ---
  const handleDeleteList = async (listId) => {
    if (!window.confirm("Delete this list and all its cards?")) return;
    try {
      const { data } = await axios.delete(`${backendUrl}/api/lists/${listId}`);
      if (data.success) {
        setLists((prev) => prev.filter((l) => l._id !== listId));
        const copy = { ...cardsByList };
        delete copy[listId];
        setCardsByList(copy);
        toast.success("List deleted!");
      }
    } catch {
      toast.error("Failed to delete list");
    }
  };

  // --- CREATE CARD ---
  const handleCreateCard = async (e) => {
    e.preventDefault();
    if (!cardTitle.trim()) return toast.error("Card title required");

    try {
      setCreatingCard(true);
      const { data } = await axios.post(
        `${backendUrl}/api/cards/lists/${activeListId}`,
        { title: cardTitle, description: cardDescription }
      );

      if (data.success && data.card) {
        const newCard = { ...data.card, createdBy: data.card.createdBy || {} };
        setCardsByList((prev) => ({
          ...prev,
          [activeListId]: [...(prev[activeListId] || []), newCard],
        }));
        setShowCardModal(false);
        setCardTitle("");
        setCardDescription("");
        setActiveListId(null);
        toast.success("Card created!");
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to create card");
    } finally {
      setCreatingCard(false);
    }
  };

  // --- DELETE CARD ---
  const handleDeleteCard = async (cardId, listId) => {
    if (!window.confirm("Delete this card?")) return;
    try {
      const { data } = await axios.delete(`${backendUrl}/api/cards/${cardId}`);
      if (data.success) {
        setCardsByList((prev) => ({
          ...prev,
          [listId]: prev[listId].filter((c) => c._id !== cardId),
        }));
        
        // Close card details modal if it's open
        if (showCardDetails && activeCard?._id === cardId) {
          setShowCardDetails(false);
          setActiveCard(null);
        }
        
        toast.success("Card deleted!");
      }
    } catch {
      toast.error("Failed to delete card");
    }
  };

  // --- EDIT CARD ---
  const handleEditCard = async (e) => {
    e.preventDefault();
    if (!activeCard) return;

    try {
      const { data } = await axios.put(`${backendUrl}/api/cards/${activeCard._id}`, {
        title: editTitle,
        description: editDescription,
      });

      if (data.success) {
        setCardsByList((prev) => {
          const copy = { ...prev };
          Object.keys(copy).forEach((listId) => {
            copy[listId] = copy[listId].map((card) =>
              card._id === activeCard._id
                ? { ...card, title: editTitle, description: editDescription }
                : card
            );
          });
          return copy;
        });
        setActiveCard({ ...activeCard, title: editTitle, description: editDescription });
        setEditing(false);
        toast.success("Card updated!");
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to update card");
    }
  };

  // --- DRAG AND DROP ---
  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    
    if (!destination) return;
    
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Store previous state for rollback
    const previousCardsByList = JSON.parse(JSON.stringify(cardsByList));

    try {
      // Create new state
      const newCardsByList = { ...cardsByList };
      
      // Get source list array (create copy)
      const sourceList = [...(newCardsByList[source.droppableId] || [])];
      // Get destination list array (create copy)  
      const destList = [...(newCardsByList[destination.droppableId] || [])];
      
      // Find the card being moved
      const cardIndex = sourceList.findIndex(card => card._id === draggableId);
      if (cardIndex === -1) {
        console.error("Card not found in source list");
        return;
      }
      
      const [movedCard] = sourceList.splice(cardIndex, 1);
      
      // Update card's listID
      const updatedCard = {
        ...movedCard,
        listID: destination.droppableId
      };
      
      // Insert into destination list
      destList.splice(destination.index, 0, updatedCard);
      
      // Update state
      newCardsByList[source.droppableId] = sourceList;
      newCardsByList[destination.droppableId] = destList;
      
      // Force update by creating new object
      setCardsByList(newCardsByList);

      console.log("Moving card:", {
        cardId: draggableId,
        from: source.droppableId,
        to: destination.droppableId,
        position: destination.index
      });

      // Send to backend
      const response = await axios.put(`${backendUrl}/api/cards/${draggableId}/move`, {
        listID: destination.droppableId,
        position: destination.index,
      });

      if (response.data.success) {
        toast.success("Card moved successfully");
        
        // Optional: Refetch to ensure complete sync with backend
        if (response.data.card) {
          setCardsByList(prev => {
            const updated = { ...prev };
            if (updated[destination.droppableId]) {
              updated[destination.droppableId] = updated[destination.droppableId].map(card =>
                card._id === draggableId ? { ...card, ...response.data.card } : card
              );
            }
            return updated;
          });
        }
      } else {
        throw new Error(response.data.message || "Failed to move card");
      }
      
    } catch (error) {
      // Rollback on error
      setCardsByList(previousCardsByList);
      toast.error("Failed to move card");
      console.error("Drag error:", error.response?.data || error.message);
    }
  };

  // --- CLOSE MODALS WITH STATE CLEANUP ---
  const closeListModal = () => {
    setShowListModal(false);
    setListTitle("");
  };

  const closeCardModal = () => {
    setShowCardModal(false);
    setCardTitle("");
    setCardDescription("");
    setActiveListId(null);
  };

  const closeCardDetails = () => {
    setShowCardDetails(false);
    setActiveCard(null);
    setEditing(false);
    setEditTitle("");
    setEditDescription("");
  };

  // Debug useEffect to track state changes
  useEffect(() => {
    console.log("cardsByList updated:", cardsByList);
  }, [cardsByList]);

  useEffect(() => {
    console.log("Lists updated:", lists);
  }, [lists]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-indigo-600">
        Loading board...
      </div>
    );

  const isOwner = board?.createdBy?._id === user?._id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">{board.title}</h1>
            {board.description && (
              <p className="text-gray-600 text-sm mt-1">{board.description}</p>
            )}
          </div>

          {isOwner && (
            <button
              onClick={() => setShowListModal(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 shadow-md transition"
            >
              <Plus size={18} />
              Add List
            </button>
          )}
        </div>

        {/* DRAG CONTEXT */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex overflow-x-auto space-x-5 pb-10" style={{ scrollbarWidth: 'thin' }}>
            {lists.map((list) => (
              <Droppable droppableId={list._id} key={list._id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`w-72 flex-shrink-0 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-4 ${
                      snapshot.isDraggingOver ? 'bg-blue-50 border-blue-300' : ''
                    }`}
                    data-list-id={list._id}
                    data-card-count={cardsByList[list._id]?.length || 0}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-gray-900 text-lg">{list.title}</h3>
                      {isOwner && (
                        <button
                          onClick={() => handleDeleteList(list._id)}
                          className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>

                    <div className="flex flex-col gap-3 mb-4 min-h-[40px]">
                      {(cardsByList[list._id] || []).map((card, index) => (
                        <Draggable
                          draggableId={card._id}
                          index={index}
                          key={card._id}
                        >
                          {(provided, snapshot) => (
                            <div
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              ref={provided.innerRef}
                              onClick={() => {
                                setActiveCard(card);
                                setEditTitle(card.title);
                                setEditDescription(card.description || "");
                                setShowCardDetails(true);
                              }}
                              className={`bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm text-gray-700 cursor-pointer transition-all hover:shadow-sm ${
                                snapshot.isDragging ? "opacity-80 rotate-1 shadow-lg" : ""
                              } ${snapshot.isDragging ? 'bg-blue-100 border-blue-300' : ''}`}
                              data-card-id={card._id}
                              data-list-id={card.listID}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-gray-800 truncate">
                                    {card.title}
                                  </h4>
                                  {card.description && (
                                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                                      {card.description}
                                    </p>
                                  )}
                                </div>
                                {isOwner && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteCard(card._id, list._id);
                                    }}
                                    className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 flex-shrink-0"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>

                    <button
                      onClick={() => {
                        setActiveListId(list._id);
                        setShowCardModal(true);
                      }}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium w-full text-left"
                    >
                      + Add card
                    </button>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* ---- Modals ---- */}

      {/* Create List */}
      {showListModal && (
        <Modal onClose={closeListModal} title="Create a new list">
          <form onSubmit={handleCreateList}>
            <input
              value={listTitle}
              onChange={(e) => setListTitle(e.target.value)}
              placeholder="List Title"
              className="w-full px-4 py-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              autoFocus
            />
            <button
              type="submit"
              disabled={creatingList}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {creatingList ? "Creating..." : "Create"}
            </button>
          </form>
        </Modal>
      )}

      {/* Create Card */}
      {showCardModal && (
        <Modal onClose={closeCardModal} title="Create a new card">
          <form onSubmit={handleCreateCard}>
            <input
              value={cardTitle}
              onChange={(e) => setCardTitle(e.target.value)}
              placeholder="Card Title"
              className="w-full px-4 py-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              autoFocus
            />
            <textarea
              value={cardDescription}
              onChange={(e) => setCardDescription(e.target.value)}
              placeholder="Description (optional)"
              className="w-full px-4 py-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={3}
            />
            <button
              type="submit"
              disabled={creatingCard}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {creatingCard ? "Creating..." : "Create"}
            </button>
          </form>
        </Modal>
      )}

      {/* Card Details */}
      {showCardDetails && activeCard && (
        <Modal
          onClose={closeCardDetails}
          title={editing ? "Edit Card" : activeCard.title}
        >
          {!editing ? (
            <>
              <p className="text-gray-600 mb-6 whitespace-pre-wrap">
                {activeCard.description || "No description yet."}
              </p>
              {isOwner && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center justify-center gap-2 flex-1 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    <Edit3 size={16} /> Edit
                  </button>
                  <button
                    onClick={() => {
                      const listId = findCardListId(activeCard._id);
                      if (listId) {
                        handleDeleteCard(activeCard._id, listId);
                      } else {
                        toast.error("Could not find card's list");
                      }
                    }}
                    className="flex items-center justify-center gap-2 flex-1 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleEditCard}>
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full p-3 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Card title"
                required
                autoFocus
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                rows={4}
                placeholder="Card description"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="flex-1 py-2.5 border rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Save
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};

// Generic Modal Component
const Modal = ({ children, onClose, title }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-fadeIn">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
      >
        <X size={20} />
      </button>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">{title}</h2>
      {children}
    </div>
  </div>
);

export default BoardDetails; 