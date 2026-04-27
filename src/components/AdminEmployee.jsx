// frontend/src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useEmployeeAuth } from "../context/EmployeeAuthContext";
import { adminAPI } from "../api/adminEmployeeAPI";
import {
  Users, Calendar, CheckCircle, Briefcase, TrendingUp,
  UserCircle, LogOut, Search, ChevronLeft, ChevronRight,
  Clock, FileText, Award, Activity, Eye, Loader,
  XCircle, Check, AlertCircle, Trophy, Medal, Crown,
  Star, Target, Zap, Sparkles, BarChart, PieChart,
  TrendingDown, ArrowUp, ArrowDown, Filter, Download,
  Timer, ListChecks, CheckSquare
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
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [sortBy, setSortBy] = useState("points");
  const [filterStatus, setFilterStatus] = useState("all");

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

  // Calculate total hours worked from daily records
  const calculateTotalHours = (dailyRecords) => {
    if (!dailyRecords || dailyRecords.length === 0) return 0;
    
    let totalHours = 0;
    dailyRecords.forEach(record => {
      if (record.loginTime && record.logoutTime) {
        const login = new Date(record.loginTime);
        const logout = new Date(record.logoutTime);
        const hours = (logout - login) / (1000 * 60 * 60);
        if (hours > 0 && hours < 24) {
          totalHours += hours;
        }
      }
    });
    return Math.round(totalHours * 10) / 10;
  };

  // Calculate points based on hours worked, tasks completed, and tasks total
  const calculateEmployeePoints = (emp) => {
    let points = 0;
    
    // Hours worked points (40 hours = 400 points, max 500)
    const totalHours = calculateTotalHours(emp.dailyRecords);
    points += Math.min(totalHours * 10, 500);
    
    // Task completion rate points (max 300)
    const completionRate = emp.workCompletionRate || 0;
    points += Math.floor(completionRate * 3);
    
    // Bonus for completed tasks (max 200)
    points += Math.min(emp.completedWorkItems * 2, 200);
    
    // Consistency bonus for high task completion (max 100)
    if (emp.totalWorkItems > 0 && emp.workCompletionRate >= 90) {
      points += 100;
    } else if (emp.totalWorkItems > 0 && emp.workCompletionRate >= 75) {
      points += 50;
    }
    
    return Math.floor(points);
  };

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, employeesRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getAllEmployees()
      ]);
      
      if (statsRes.success) setStats(statsRes.stats);
      if (employeesRes.success) {
        const employeesWithData = employeesRes.employees.map(emp => ({
          ...emp,
          totalHours: calculateTotalHours(emp.dailyRecords),
          points: 0,
          rank: 0
        }));
        
        // Calculate points for each employee
        const employeesWithPoints = employeesWithData.map(emp => ({
          ...emp,
          points: calculateEmployeePoints(emp)
        }));
        
        const sorted = [...employeesWithPoints].sort((a, b) => b.points - a.points);
        const ranked = sorted.map((emp, idx) => ({ ...emp, rank: idx + 1 }));
        setEmployees(ranked);
      }
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
        const totalHours = calculateTotalHours(response.employee.dailyRecords);
        const empWithData = {
          ...response.employee,
          totalHours: totalHours,
          points: calculateEmployeePoints(response.employee)
        };
        setSelectedEmployee(empWithData);
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
    return selectedEmployee.dailyRecords?.find(
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

  const getRankIcon = (rank) => {
    switch(rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Medal className="w-5 h-5 text-amber-600" />;
      default: return <Star className="w-4 h-4 text-blue-500" />;
    }
  };

  const getPointsBadgeColor = (points) => {
    if (points >= 800) return "bg-gradient-to-r from-purple-500 to-pink-500";
    if (points >= 500) return "bg-gradient-to-r from-blue-500 to-indigo-500";
    if (points >= 300) return "bg-gradient-to-r from-green-500 to-teal-500";
    return "bg-gradient-to-r from-gray-500 to-gray-600";
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && emp.isActive) ||
                         (filterStatus === "inactive" && !emp.isActive);
    return matchesSearch && matchesStatus;
  });

  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    if (sortBy === "points") return b.points - a.points;
    if (sortBy === "hours") return b.totalHours - a.totalHours;
    if (sortBy === "tasks") return b.completedWorkItems - a.completedWorkItems;
    if (sortBy === "completion") return b.workCompletionRate - a.workCompletionRate;
    return 0;
  });

  const getAverageStats = () => {
    if (employees.length === 0) return { avgHours: 0, avgTasks: 0, avgPoints: 0 };
    const avgHours = employees.reduce((sum, e) => sum + (e.totalHours || 0), 0) / employees.length;
    const avgTasks = employees.reduce((sum, e) => sum + (e.completedWorkItems || 0), 0) / employees.length;
    const avgPoints = employees.reduce((sum, e) => sum + (e.points || 0), 0) / employees.length;
    return { avgHours, avgTasks, avgPoints };
  };

  const averages = getAverageStats();

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
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
                <Users className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Manage and monitor employee activities</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLeaderboard(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-xl transition-all hover:shadow-lg"
              >
                <Trophy className="w-4 h-4" />
                <span>Leaderboard</span>
              </button>
              {/* <button
                onClick={() => navigate("/employee-dashboard")}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
              >
                <Eye className="w-4 h-4" />
                <span>My Dashboard</span>
              </button> */}
              {/* <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-xl transition-all text-red-700"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button> */}
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
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Employees</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalEmployees}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Active: {stats.activeEmployees}</span>
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">Inactive: {stats.inactiveEmployees}</span>
                  </div>
                </div>
                <Users className="w-12 h-12 text-blue-400 opacity-75" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Tasks Completed</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.completedWorkItems}</p>
                  <p className="text-sm text-gray-600 mt-1">of {stats.totalWorkItems} total</p>
                </div>
                <CheckSquare className="w-12 h-12 text-green-400 opacity-75" />
              </div>
              <div className="w-full bg-green-200 rounded-full h-2 mt-3">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${stats.overallWorkCompletionRate}%` }}></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl shadow-lg p-6 border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">Completion Rate</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{Math.round(stats.overallWorkCompletionRate)}%</p>
                  <p className="text-sm text-gray-600 mt-1">Work items completion</p>
                </div>
                <Target className="w-12 h-12 text-orange-400 opacity-75" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Active Today</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeToday}</p>
                  <p className="text-sm text-gray-600 mt-1">Employees working today</p>
                </div>
                <Activity className="w-12 h-12 text-purple-400 opacity-75" />
              </div>
            </div>
          </div>
        )}

        {/* Average Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Avg Hours Worked</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(averages.avgHours)} hrs</p>
              </div>
              <Timer className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Avg Tasks Completed</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(averages.avgTasks)}</p>
              </div>
              <ListChecks className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Avg Points</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(averages.avgPoints)}</p>
              </div>
              <Award className="w-8 h-8 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6 border border-gray-200">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 w-64"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900"
              >
                <option value="points">Sort by Points</option>
                <option value="hours">Sort by Hours</option>
                <option value="tasks">Sort by Tasks</option>
                <option value="completion">Sort by Completion</option>
              </select>
            </div>
            <div className="text-sm text-gray-500">
              Showing {sortedEmployees.length} of {employees.length} employees
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Employee List with Points */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Employee Rankings
              </h2>

              <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
                {sortedEmployees.map(emp => (
                  <button
                    key={emp._id}
                    onClick={() => fetchEmployeeDetails(emp._id)}
                    className={`w-full text-left p-4 rounded-xl transition-all ${selectedEmployee?._id === emp._id ? 'bg-gray-900 text-white' : 'bg-gray-50 hover:bg-gray-100'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-12 text-center">
                        <div className="flex justify-center">
                          {getRankIcon(emp.rank)}
                        </div>
                        <span className={`text-xs font-bold ${selectedEmployee?._id === emp._id ? 'text-gray-300' : 'text-gray-500'}`}>
                          #{emp.rank}
                        </span>
                      </div>
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
                        <p className={`text-xs ${selectedEmployee?._id === emp._id ? 'text-gray-300' : 'text-gray-500'}`}>
                          {emp.email}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded ${selectedEmployee?._id === emp._id ? 'bg-white/20' : 'bg-gray-200'}`}>
                            {emp.points} pts
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded ${selectedEmployee?._id === emp._id ? 'bg-white/20' : 'bg-gray-200'}`}>
                            {Math.round(emp.workCompletionRate || 0)}%
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
                {/* Employee Profile Header with Points */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                  <div className="flex items-center gap-4">
                    {selectedEmployee.userImage ? (
                      <img src={selectedEmployee.userImage} alt={selectedEmployee.username} className="w-20 h-20 rounded-full object-cover" />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center">
                        <UserCircle className="w-12 h-12 text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-gray-900">{selectedEmployee.username}</h2>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${selectedEmployee.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {selectedEmployee.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                      <p className="text-gray-600">{selectedEmployee.email}</p>
                      <p className="text-gray-500 text-sm">{selectedEmployee.phoneNumber}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                          {selectedEmployee.userType}
                        </span>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                          {selectedEmployee.totalWorkDays} work days
                        </span>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                          {selectedEmployee.totalHours} hours
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full text-white ${getPointsBadgeColor(selectedEmployee.points)}`}>
                          {selectedEmployee.points} Points
                        </span>
                      </div>
                    </div>
                    {selectedEmployee.rank === 1 && (
                      <div className="text-center">
                        <Crown className="w-12 h-12 text-yellow-500 mx-auto" />
                        <p className="text-xs text-gray-500 mt-1">Top Performer</p>
                      </div>
                    )}
                  </div>

                  {/* Employee Stats */}
                  <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
                    <div className="text-center">
                      <Timer className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">Total Hours</p>
                      <p className="text-2xl font-bold text-gray-900">{selectedEmployee.totalHours}</p>
                    </div>
                    <div className="text-center">
                      <ListChecks className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">Tasks Completed</p>
                      <p className="text-2xl font-bold text-gray-900">{selectedEmployee.completedWorkItems}/{selectedEmployee.totalWorkItems}</p>
                    </div>
                    <div className="text-center">
                      <Target className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">Completion Rate</p>
                      <p className="text-2xl font-bold text-gray-900">{Math.round(selectedEmployee.workCompletionRate)}%</p>
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
                      
                      // Calculate hours worked for this day
                      let hoursWorked = 0;
                      if (record.loginTime && record.logoutTime) {
                        const login = new Date(record.loginTime);
                        const logout = new Date(record.logoutTime);
                        hoursWorked = (logout - login) / (1000 * 60 * 60);
                        hoursWorked = Math.round(hoursWorked * 10) / 10;
                      }
                      
                      return (
                        <div className="space-y-4">
                          <div className="grid grid-cols-3 gap-4">
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
                            <div className="bg-gray-50 rounded-xl p-4">
                              <div className="flex items-center gap-2 text-gray-600 mb-2">
                                <Timer className="w-4 h-4" />
                                <span className="text-sm">Hours Worked</span>
                              </div>
                              <p className="text-gray-900 font-medium">
                                {hoursWorked > 0 ? `${hoursWorked} hrs` : 'Not recorded'}
                              </p>
                            </div>
                          </div>

                          <div className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-gray-600 mb-3">
                              <Briefcase className="w-4 h-4" />
                              <span className="text-sm">Work Items ({record.completedCount}/{record.workItemsCount})</span>
                            </div>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
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

      {/* Simplified Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowLeaderboard(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-yellow-500" />
                  <h2 className="text-2xl font-bold text-gray-900">Employee Leaderboard</h2>
                </div>
                <button
                  onClick={() => setShowLeaderboard(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <p className="text-gray-500 text-sm mt-2">Ranked by: Hours Worked + Tasks Completed + Task Completion Rate</p>
            </div>
            <div className="p-6">
              {/* Top 3 Podium */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {employees.slice(0, 3).map((emp, idx) => (
                  <div key={emp._id} className={`text-center p-6 rounded-xl ${idx === 0 ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300' : idx === 1 ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300' : 'bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-amber-300'}`}>
                    <div className="flex justify-center mb-3">
                      {idx === 0 && <Crown className="w-16 h-16 text-yellow-500" />}
                      {idx === 1 && <Medal className="w-16 h-16 text-gray-400" />}
                      {idx === 2 && <Medal className="w-16 h-16 text-amber-600" />}
                    </div>
                    {emp.userImage ? (
                      <img src={emp.userImage} alt={emp.username} className="w-20 h-20 rounded-full object-cover mx-auto mb-3" />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center mx-auto mb-3">
                        <UserCircle className="w-12 h-12 text-gray-600" />
                      </div>
                    )}
                    <h3 className="font-bold text-gray-900 text-lg">{emp.username}</h3>
                    <p className="text-gray-500 text-sm">{emp.email}</p>
                    <div className="mt-3">
                      <span className={`inline-block px-4 py-2 rounded-lg text-white font-bold ${getPointsBadgeColor(emp.points)}`}>
                        {emp.points} Points
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Full Leaderboard Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rank</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Employee</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Points</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Hours Worked</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Tasks Done</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Completion Rate</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {employees.map((emp, idx) => (
                      <tr key={emp._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {getRankIcon(idx + 1)}
                            <span className="font-semibold text-gray-900">#{idx + 1}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {emp.userImage ? (
                              <img src={emp.userImage} alt={emp.username} className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                                <UserCircle className="w-5 h-5 text-gray-600" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{emp.username}</p>
                              <p className="text-xs text-gray-500">{emp.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-lg text-sm font-bold text-white ${getPointsBadgeColor(emp.points)}`}>
                            {emp.points}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Timer className="w-4 h-4 text-gray-400" />
                            <span className="font-semibold text-gray-900">{emp.totalHours || 0} hrs</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <CheckSquare className="w-4 h-4 text-green-500" />
                            <span className="font-semibold text-gray-900">{emp.completedWorkItems}/{emp.totalWorkItems}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-semibold text-gray-900">{Math.round(emp.workCompletionRate || 0)}%</span>
                            <div className="w-16 bg-gray-200 rounded-full h-1 mt-1">
                              <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${emp.workCompletionRate || 0}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${emp.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {emp.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}