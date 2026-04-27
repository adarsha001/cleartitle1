// frontend/src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useEmployeeAuth } from "../context/EmployeeAuthContext";
import { adminAPI } from "../api/adminEmployeeAPI";
import {
  Users, Calendar, CheckCircle, Briefcase, TrendingUp,
  UserCircle, LogOut, Search, ChevronLeft, ChevronRight,
  Clock, FileText, Award, Activity, Eye, Loader,
  XCircle, Check, AlertCircle
} from "lucide-react";

export default function AdminEmployee() {
  const navigate = useNavigate();
  const { employee, logout, isAuthenticated } = useEmployeeAuth();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/employee-login");
      return;
    }
    if (employee && !employee.isAdmin && employee.userType !== 'admin') {
      navigate("/employee-dashboard");
      return;
    }
    fetchAdminData();
  }, [isAuthenticated, employee, navigate]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, employeesRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getAllEmployees()
      ]);
      
      if (statsRes.success) setStats(statsRes.stats);
      if (employeesRes.success) setEmployees(employeesRes.employees);
    } catch (error) {
      showMessage("error", "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeDetails = async (employeeId) => {
    try {
      setLoading(true);
      const response = await adminAPI.getEmployeeById(employeeId);
     
      if (response.success) {
        setSelectedEmployee(response.employee);
        setSelectedDate(null);
      }
    } catch (error) {
      showMessage("error", "Failed to load employee details");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/employee-login");
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getRecordForDate = (date) => {
    if (!selectedEmployee || !date) return null;
    return selectedEmployee.dailyRecords.find(
      record => new Date(record.date).toDateString() === date.toDateString()
    );
  };

  const getDayStatus = (date) => {
    const record = getRecordForDate(date);
    if (!record) return "absent";
    if (record.dayCompleted) return "completed";
    return "partial";
  };

  const getDayColor = (status) => {
    switch(status) {
      case "completed": return "bg-green-500 text-white";
      case "partial": return "bg-yellow-500 text-white";
      case "absent": return "bg-gray-200 text-gray-600";
      default: return "bg-white border-2 border-gray-200";
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-8 h-8 text-gray-900 animate-spin" />
        <span className="text-gray-900 ml-2 font-medium">Loading Admin Panel...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-200">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center">
                <Users className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Manage and monitor employee activities</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/employee-dashboard")}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
              >
                <Eye className="w-4 h-4" />
                <span>My Dashboard</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-xl transition-all text-red-700"
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

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Employees</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalEmployees}</p>
                </div>
                <Users className="w-12 h-12 text-gray-400" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Active Today</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeToday}</p>
                </div>
                <Activity className="w-12 h-12 text-gray-400" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Work Items</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalWorkItems}</p>
                </div>
                <Briefcase className="w-12 h-12 text-gray-400" />
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completion</span>
                  <span className="text-gray-900 font-medium">{Math.round(stats.overallWorkCompletionRate)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-gray-900 h-2 rounded-full" style={{ width: `${stats.overallWorkCompletionRate}%` }}></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Completed Days</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalCompletedDays}/{stats.totalWorkDays}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-gray-400" />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Employee List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 sticky top-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Employees</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                  />
                </div>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
                {filteredEmployees.map(emp => (
                  <button
                    key={emp._id}
                    onClick={() => fetchEmployeeDetails(emp._id)}
                    className={`w-full text-left p-4 rounded-xl transition-all ${selectedEmployee?._id === emp._id ? 'bg-gray-900 text-white' : 'bg-gray-50 hover:bg-gray-100'}`}
                  >
                    <div className="flex items-center gap-3">
                      {emp.userImage ? (
                        <img src={emp.userImage} alt={emp.username} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                          <UserCircle className="w-8 h-8 text-gray-600" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className={`font-semibold ${selectedEmployee?._id === emp._id ? 'text-white' : 'text-gray-900'}`}>
                          {emp.username}
                        </p>
                        <p className={`text-sm ${selectedEmployee?._id === emp._id ? 'text-gray-300' : 'text-gray-600'}`}>
                          {emp.email}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded ${selectedEmployee?._id === emp._id ? 'bg-white/20' : 'bg-gray-200'}`}>
                            {emp.totalWorkDays} days
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded ${selectedEmployee?._id === emp._id ? 'bg-white/20' : 'bg-gray-200'}`}>
                            {emp.completedWorkItems}/{emp.totalWorkItems} tasks
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Calendar and Details */}
          <div className="lg:col-span-2">
            {selectedEmployee ? (
              <div className="space-y-6">
                {/* Employee Profile Header */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                  <div className="flex items-center gap-4">
                    {selectedEmployee.userImage ? (
                      <img src={selectedEmployee.userImage} alt={selectedEmployee.username} className="w-20 h-20 rounded-full object-cover" />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center">
                        <UserCircle className="w-12 h-12 text-white" />
                      </div>
                    )}
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedEmployee.username}</h2>
                      <p className="text-gray-600">{selectedEmployee.email}</p>
                      <p className="text-gray-500 text-sm">{selectedEmployee.phoneNumber}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                          {selectedEmployee.userType}
                        </span>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                          {selectedEmployee.totalWorkDays} work days
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Employee Stats */}
                  <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
                    <div>
                      <p className="text-gray-600 text-sm">Work Completion Rate</p>
                      <p className="text-2xl font-bold text-gray-900">{Math.round(selectedEmployee.workCompletionRate)}%</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-gray-900 h-2 rounded-full" style={{ width: `${selectedEmployee.workCompletionRate}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Day Completion Rate</p>
                      <p className="text-2xl font-bold text-gray-900">{Math.round(selectedEmployee.dayCompletionRate)}%</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-gray-900 h-2 rounded-full" style={{ width: `${selectedEmployee.dayCompletionRate}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Calendar */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Activity Calendar</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <span className="px-4 py-2 font-semibold">
                        {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </span>
                      <button
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-gray-600 text-sm font-medium py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {getDaysInMonth(currentMonth).map((date, index) => {
                      if (!date) return <div key={`empty-${index}`} className="aspect-square"></div>;
                      
                      const status = getDayStatus(date);
                      const colorClass = getDayColor(status);
                      const record = getRecordForDate(date);
                      
                      return (
                        <button
                          key={date.toISOString()}
                          onClick={() => setSelectedDate(date)}
                          className={`aspect-square rounded-xl p-2 ${colorClass} hover:scale-105 transition-transform relative group`}
                        >
                          <span className="text-sm font-medium">{date.getDate()}</span>
                          {record && record.workItems.length > 0 && (
                            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                              <div className="w-1 h-1 rounded-full bg-current opacity-50"></div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex justify-center gap-6 mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm text-gray-600">Completed Day</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-sm text-gray-600">Partial Day</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-200"></div>
                      <span className="text-sm text-gray-600">No Activity</span>
                    </div>
                  </div>
                </div>

                {/* Selected Date Details */}
                {selectedDate && (
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-gray-900">
                        {selectedDate.toLocaleDateString('default', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </h3>
                      <button onClick={() => setSelectedDate(null)} className="text-gray-400 hover:text-gray-600">
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {(() => {
                      const record = getRecordForDate(selectedDate);
                      if (!record) {
                        return (
                          <div className="text-center py-12">
                            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No activity recorded for this day</p>
                          </div>
                        );
                      }
                      
                      return (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-xl p-4">
                              <div className="flex items-center gap-2 text-gray-600 mb-2">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm">Login Time</span>
                              </div>
                              <p className="text-gray-900 font-medium">
                                {new Date(record.loginTime).toLocaleTimeString()}
                              </p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                              <div className="flex items-center gap-2 text-gray-600 mb-2">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm">Logout Time</span>
                              </div>
                              <p className="text-gray-900 font-medium">
                                {record.logoutTime ? new Date(record.logoutTime).toLocaleTimeString() : 'Still active'}
                              </p>
                            </div>
                          </div>

                          <div className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-gray-600 mb-3">
                              <Briefcase className="w-4 h-4" />
                              <span className="text-sm">Work Items ({record.completedCount}/{record.workItemsCount})</span>
                            </div>
                            <div className="space-y-2">
                              {record.workItems.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded-lg">
                                  {item.completed ? (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                                  )}
                                  <span className={`flex-1 text-sm ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                    {item.description}
                                  </span>
                                  {item.image && (
                                    <img src={item.image} alt="work" className="w-8 h-8 rounded object-cover cursor-pointer" onClick={() => window.open(item.image)} />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {record.dailySummary && (
                            <div className="bg-gray-50 rounded-xl p-4">
                              <div className="flex items-center gap-2 text-gray-600 mb-2">
                                <FileText className="w-4 h-4" />
                                <span className="text-sm">Daily Summary</span>
                              </div>
                              <p className="text-gray-900">{record.dailySummary}</p>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-200 text-center">
                <Users className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select an Employee</h3>
                <p className="text-gray-600">Choose an employee from the list to view their activity calendar and details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}