// frontend/src/pages/employee/EmployeeDashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useEmployeeAuth } from "../context/EmployeeAuthContext";
import { employeeAPI } from "../api/employeeAPI";
import {
  UserCircle, LogOut, Calendar, CheckCircle, XCircle,
  Briefcase, TrendingUp, Clock, FileText, Save,
  Check, AlertCircle, Plus, Trash2, Edit2,
  Loader, Camera, Award, Target
} from "lucide-react";

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { employee, logout, isAuthenticated, loading: authLoading } = useEmployeeAuth();
  const [workItems, setWorkItems] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newWorkDescription, setNewWorkDescription] = useState("");
  const [dailySummary, setDailySummary] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [editingIndex, setEditingIndex] = useState(null);
  const [editDescription, setEditDescription] = useState("");
  const [uploadingImage, setUploadingImage] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showImageModal, setShowImageModal] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/employee-login");
      return;
    }
    if (isAuthenticated && employee) {
      fetchAllData();
    }
  }, [isAuthenticated, authLoading, employee, navigate]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('employeeToken');
      if (!token) {
        navigate("/employee-login");
        return;
      }

      const [workItemsRes, statsRes] = await Promise.all([
        employeeAPI.getTodayWorkItems().catch(err => ({ workItems: [], hasRecord: false })),
        employeeAPI.getStats().catch(err => ({ stats: null }))
      ]);

      setWorkItems(workItemsRes.workItems || []);
      setTodayRecord({
        hasRecord: workItemsRes.hasRecord,
        loginTime: workItemsRes.loginTime,
        logoutTime: workItemsRes.logoutTime,
        dayCompleted: workItemsRes.dayCompleted
      });
      setDailySummary(workItemsRes.dailySummary || "");
      setStats(statsRes.stats);
      setIsInitialized(true);
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error.response?.status === 401) {
        await logout();
        navigate("/employee-login");
      } else {
        setMessage({ type: "error", text: "Failed to load dashboard data" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/employee-login");
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const handleAddWorkItem = async () => {
    if (!newWorkDescription.trim()) {
      showMessage("error", "Please enter work description");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await employeeAPI.addWorkItem({ description: newWorkDescription });
      if (response.success) {
        setWorkItems([...workItems, response.workItem]);
        setNewWorkDescription("");
        showMessage("success", "Work item added successfully!");
      }
    } catch (error) {
      showMessage("error", error.message || "Failed to add work item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadImage = async (index) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      setUploadingImage(index);
      try {
        const response = await employeeAPI.uploadWorkImage(index, file);
        if (response.success) {
          const updatedItems = [...workItems];
          updatedItems[index] = response.workItem;
          setWorkItems(updatedItems);
          showMessage("success", "Image uploaded successfully!");
        }
      } catch (error) {
        showMessage("error", error.message || "Failed to upload image");
      } finally {
        setUploadingImage(null);
      }
    };
    fileInput.click();
  };

  const handleCompleteWorkItem = async (index) => {
    setIsSubmitting(true);
    try {
      const response = await employeeAPI.completeWorkItem(index);
      if (response.success) {
        const updatedItems = [...workItems];
        updatedItems[index] = response.workItem;
        setWorkItems(updatedItems);
        setTodayRecord(prev => ({ ...prev, dayCompleted: response.dayCompleted }));
        showMessage("success", "Work item marked as completed!");
        const statsRes = await employeeAPI.getStats();
        setStats(statsRes.stats);
      }
    } catch (error) {
      showMessage("error", error.message || "Failed to mark as completed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateWorkItem = async (index) => {
    if (!editDescription.trim()) {
      showMessage("error", "Description cannot be empty");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await employeeAPI.updateWorkItem(index, editDescription);
      if (response.success) {
        const updatedItems = [...workItems];
        updatedItems[index] = response.workItem;
        setWorkItems(updatedItems);
        setEditingIndex(null);
        setEditDescription("");
        showMessage("success", "Work item updated successfully!");
      }
    } catch (error) {
      showMessage("error", error.message || "Failed to update work item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWorkItem = async (index) => {
    if (!window.confirm("Are you sure you want to delete this work item?")) return;

    setIsSubmitting(true);
    try {
      const response = await employeeAPI.deleteWorkItem(index);
      if (response.success) {
        setWorkItems(response.workItems);
        setTodayRecord(prev => ({ ...prev, dayCompleted: response.dayCompleted }));
        showMessage("success", "Work item deleted successfully!");
        const statsRes = await employeeAPI.getStats();
        setStats(statsRes.stats);
      }
    } catch (error) {
      showMessage("error", error.message || "Failed to delete work item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateDailySummary = async () => {
    setIsSubmitting(true);
    try {
      const response = await employeeAPI.updateDailySummary(dailySummary);
      if (response.success) {
        showMessage("success", "Daily summary updated!");
      }
    } catch (error) {
      showMessage("error", error.message || "Failed to update summary");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (index, description) => {
    setEditingIndex(index);
    setEditDescription(description);
  };

  const getProgressPercentage = () => {
    if (workItems.length === 0) return 0;
    const completed = workItems.filter(i => i.completed).length;
    return (completed / workItems.length) * 100;
  };

  if (authLoading || loading || !isInitialized) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader className="w-8 h-8 text-gray-900 animate-spin" />
        <span className="text-gray-900 ml-2 font-medium">Loading dashboard...</span>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-200">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                {employee?.userImage ? (
                  <img src={employee.userImage} alt={employee.username} className="w-16 h-16 rounded-full object-cover border-2 border-gray-900" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center">
                    <UserCircle className="w-10 h-10 text-white" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {employee?.username}!</h1>
                <p className="text-gray-600">{employee?.email}</p>
                <p className="text-gray-400 text-sm">{employee?.phoneNumber}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/employee/profile")}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-300 text-gray-900 font-medium"
              >
                <UserCircle className="w-4 h-4" />
                <span>Profile</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-xl transition-all duration-300 text-red-700 font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl ${message.type === "success" ? "bg-green-100 border border-green-300" : "bg-red-100 border border-red-300"} animate-slideDown`}>
            <div className="flex items-center gap-3">
              {message.type === "success" ? <Check className="w-5 h-5 text-green-700" /> : <AlertCircle className="w-5 h-5 text-red-700" />}
              <p className={message.type === "success" ? "text-green-800" : "text-red-800"}>{message.text}</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Work Items</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalWorkItems}</p>
                </div>
                <Briefcase className="w-12 h-12 text-gray-400" />
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completed</span>
                  <span className="text-gray-900 font-medium">{stats.completedWorkItems}/{stats.totalWorkItems}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-gray-900 h-2 rounded-full transition-all duration-500" style={{ width: `${stats.workCompletionRate}%` }}></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Completed Days</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.completedDays}/{stats.totalDays}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-gray-400" />
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="text-gray-900 font-medium">{stats.completionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-gray-900 h-2 rounded-full transition-all duration-500" style={{ width: `${stats.completionRate}%` }}></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Days</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalDays}</p>
                </div>
                <Calendar className="w-12 h-12 text-gray-400" />
              </div>
              <div className="mt-3">
                <p className="text-gray-600 text-sm">Days worked total</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Today's Progress</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{Math.round(getProgressPercentage())}%</p>
                </div>
                <Target className="w-12 h-12 text-gray-400" />
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div className="bg-gray-900 h-2 rounded-full transition-all duration-500" style={{ width: `${getProgressPercentage()}%` }}></div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Work Items Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Work Items */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-gray-700" />
                  Today's Tasks
                  {todayRecord?.dayCompleted && (
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">Day Completed ✓</span>
                  )}
                </h2>
                <div className="text-gray-600 text-sm">
                  {workItems.filter(i => i.completed).length}/{workItems.length} Completed
                </div>
              </div>

              {/* Add new work item */}
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={newWorkDescription}
                  onChange={(e) => setNewWorkDescription(e.target.value)}
                  placeholder="Add a new task..."
                  className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-xl p-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-900 transition-all"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddWorkItem()}
                  disabled={isSubmitting}
                />
                <button
                  onClick={handleAddWorkItem}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-gray-900 hover:bg-gray-800 rounded-xl transition-all duration-300 disabled:opacity-50 shadow-md text-white"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Work items list */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
                {workItems.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No tasks yet. Start by adding your first task!</p>
                  </div>
                ) : (
                  workItems.map((item, index) => (
                    <div
                      key={item._id || index}
                      className={`bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all duration-300 ${item.completed ? 'opacity-75' : ''}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          {editingIndex === index ? (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                className="flex-1 bg-white border border-gray-300 rounded-lg p-2 text-gray-900 focus:outline-none focus:border-gray-900"
                                autoFocus
                              />
                              <button onClick={() => handleUpdateWorkItem(index)} className="px-3 py-1 bg-green-100 hover:bg-green-200 rounded-lg transition-all">
                                <Save className="w-4 h-4 text-green-700" />
                              </button>
                              <button onClick={() => setEditingIndex(null)} className="px-3 py-1 bg-red-100 hover:bg-red-200 rounded-lg transition-all">
                                <XCircle className="w-4 h-4 text-red-700" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <p className={`text-gray-900 ${item.completed ? 'line-through text-gray-500' : ''}`}>
                                {item.description}
                              </p>
                              <div className="flex gap-3 mt-1">
                                {item.createdAt && (
                                  <p className="text-gray-500 text-xs">
                                    Added: {new Date(item.createdAt).toLocaleTimeString()}
                                  </p>
                                )}
                                {item.completedAt && (
                                  <p className="text-green-600 text-xs">
                                    Completed: {new Date(item.completedAt).toLocaleTimeString()}
                                  </p>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                        <div className="flex gap-2 ml-3">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt="Work"
                              className="w-12 h-12 rounded-lg object-cover cursor-pointer hover:scale-110 transition-transform"
                              onClick={() => setShowImageModal(item.image)}
                            />
                          ) : (
                            <button
                              onClick={() => handleUploadImage(index)}
                              disabled={uploadingImage === index}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {uploadingImage === index ? <Loader className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                            </button>
                          )}
                          {!item.completed && !editingIndex && (
                            <>
                              <button onClick={() => startEdit(index, item.description)} className="text-blue-600 hover:text-blue-700 transition-colors">
                                <Edit2 className="w-5 h-5" />
                              </button>
                              <button onClick={() => handleCompleteWorkItem(index)} className="text-green-600 hover:text-green-700 transition-colors">
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button onClick={() => handleDeleteWorkItem(index)} className="text-red-600 hover:text-red-700 transition-colors">
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Daily Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-700" />
                Daily Reflection
              </h2>
              <textarea
                value={dailySummary}
                onChange={(e) => setDailySummary(e.target.value)}
                placeholder="Write a summary of your day, achievements, challenges, and tomorrow's plan..."
                rows="6"
                className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-900 transition-all"
              />
              <button
                onClick={handleUpdateDailySummary}
                disabled={isSubmitting}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 rounded-xl transition-all duration-300 shadow-md text-white"
              >
                <Save className="w-4 h-4" />
                Save Reflection
              </button>
            </div>

            {/* Today's Status */}
            {todayRecord && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-700" />
                  Today's Overview
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Login Time</span>
                    <span className="text-gray-900 font-medium">
                      {todayRecord.loginTime ? new Date(todayRecord.loginTime).toLocaleTimeString() : 'Not logged in'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Status</span>
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${todayRecord.logoutTime ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {todayRecord.logoutTime ? 'Signed Out' : 'Active'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Total Tasks</span>
                    <span className="text-gray-900 font-medium">{workItems.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Completed</span>
                    <span className="text-green-600 font-medium">{workItems.filter(i => i.completed).length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Pending</span>
                    <span className="text-orange-600 font-medium">{workItems.filter(i => !i.completed).length}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Achievement Badge */}
            {stats && stats.workCompletionRate >= 80 && (
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-lg p-6 border border-yellow-200 text-center">
                <Award className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                <h3 className="text-gray-900 font-bold text-lg">Great Performance!</h3>
                <p className="text-gray-600 text-sm mt-1">
                  You've completed {stats.workCompletionRate}% of your tasks
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={() => setShowImageModal(null)}>
          <div className="relative max-w-4xl w-full">
            <img src={showImageModal} alt="Full size" className="w-full h-auto rounded-xl" />
            <button
              onClick={() => setShowImageModal(null)}
              className="absolute top-4 right-4 bg-black/50 p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <XCircle className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}