import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  MapPin, 
  ArrowRight, 
  Calendar, 
  Home,
  Target,
  Shield,
  Award,
  ChevronRight,
  Info,
  DollarSign
} from 'lucide-react';

const BengaluruEastLandPriceChart = () => {
  const [selectedYear, setSelectedYear] = useState(2024);
  const [hoveredData, setHoveredData] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Land price data for Bengaluru East (per sq ft)
  const landPriceData = [
    { year: 2018, price: 4500, growth: 12, label: "Infrastructure Push" },
    { year: 2019, price: 5200, growth: 15.5, label: "IT Corridor Expansion" },
    { year: 2020, price: 5800, growth: 11.5, label: "Post-Pandemic Surge" },
    { year: 2021, price: 6800, growth: 17.2, label: "Metro Connectivity" },
    { year: 2022, price: 8200, growth: 20.6, label: "Industrial Growth" },
    { year: 2023, price: 10500, growth: 28, label: "Smart City Projects" },
    { year: 2024, price: 13500, growth: 28.6, label: "Current Market" },
    { year: 2025, price: 17000, growth: 25.9, label: "Projected Growth" },
    { year: 2026, price: 21000, growth: 23.5, label: "Future Projection" },
  ];

  // Find current data
  const currentData = landPriceData.find(data => data.year === selectedYear) || landPriceData[6];
  const maxPrice = Math.max(...landPriceData.map(d => d.price));
  const totalGrowth = ((landPriceData[landPriceData.length - 1].price - landPriceData[0].price) / landPriceData[0].price * 100).toFixed(1);

  // Calculate investment returns
  const calculateInvestment = (investment) => {
    const basePrice = landPriceData[0].price;
    const currentPrice = currentData.price;
    const area = investment / basePrice;
    const currentValue = area * currentPrice;
    const profit = currentValue - investment;
    const roi = (profit / investment * 100).toFixed(1);
    
    return { 
      area: area.toFixed(1), 
      currentValue: Math.round(currentValue).toLocaleString(), 
      profit: Math.round(profit).toLocaleString(), 
      roi 
    };
  };

  // Example investments (mobile: show only 2, desktop: show 3)
  const investments = isMobile 
    ? [
        { amount: 1000000, label: "₹10L" },
        { amount: 5000000, label: "₹50L" },
      ]
    : [
        { amount: 1000000, label: "₹10 Lakhs" },
        { amount: 5000000, label: "₹50 Lakhs" },
        { amount: 10000000, label: "₹1 Crore" },
      ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-6 md:py-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        
        {/* Header - Compact on mobile */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-1 md:gap-2 bg-blue-100 text-blue-700 px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium mb-3 md:mb-4">
            <MapPin className="w-3 h-3 md:w-4 md:h-4" />
            <span>Bengaluru East Real Estate</span>
          </div>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4">
            <span className="text-blue-600">Bengaluru East</span> Land Prices
          </h1>
          <p className="text-sm md:text-xl text-gray-600 max-w-2xl md:max-w-3xl mx-auto px-2">
            Discover explosive growth opportunities in Bengaluru's fastest developing region
          </p>
        </div>

        {/* Stats Overview - Stack on mobile */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-8 md:mb-12">
          <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-6 shadow-lg border border-blue-100">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="p-1.5 md:p-3 bg-green-100 rounded-lg md:rounded-xl">
                <TrendingUp className="w-5 h-5 md:w-8 md:h-8 text-green-600" />
              </div>
              <div>
                <div className="text-lg md:text-3xl font-bold text-gray-900">{totalGrowth}%</div>
                <div className="text-xs md:text-base text-gray-600">Total Growth</div>
              </div>
            </div>
            <p className="text-xs md:text-sm text-gray-500 mt-2">Since 2018</p>
          </div>

          <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-6 shadow-lg border border-blue-100">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="p-1.5 md:p-3 bg-blue-100 rounded-lg md:rounded-xl">
                <Home className="w-5 h-5 md:w-8 md:h-8 text-blue-600" />
              </div>
              <div>
                <div className="text-lg md:text-3xl font-bold text-gray-900">₹{currentData.price.toLocaleString()}</div>
                <div className="text-xs md:text-base text-gray-600">Current Price</div>
              </div>
            </div>
            <p className="text-xs md:text-sm text-gray-500 mt-2">Per sq ft</p>
          </div>

          <div className="col-span-2 md:col-span-1 bg-white rounded-xl md:rounded-2xl p-3 md:p-6 shadow-lg border border-blue-100">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="p-1.5 md:p-3 bg-purple-100 rounded-lg md:rounded-xl">
                <Target className="w-5 h-5 md:w-8 md:h-8 text-purple-600" />
              </div>
              <div>
                <div className="text-lg md:text-3xl font-bold text-gray-900">₹21K</div>
                <div className="text-xs md:text-base text-gray-600">2026 Projection</div>
              </div>
            </div>
            <p className="text-xs md:text-sm text-gray-500 mt-2">Expected to double</p>
          </div>
        </div>

        {/* Main Chart Section - Improved graph visibility */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-xl overflow-hidden mb-8 md:mb-12 border border-gray-200">
          <div className="p-4 md:p-8">
            <div className="flex flex-col gap-4 mb-6 md:mb-8">
              <div>
                <h2 className="text-lg md:text-2xl font-bold text-gray-900">Land Price Trend (2018-2026)</h2>
                <p className="text-sm md:text-base text-gray-600">Price per square foot in Bengaluru East</p>
              </div>
              
              {/* Year Selection - Horizontal scroll on mobile */}
              <div className="flex items-center gap-2 md:gap-4">
                <div className="flex items-center gap-1 md:gap-2 shrink-0">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                  <span className="text-xs md:text-base text-gray-700 font-medium">Year:</span>
                </div>
                <div className="flex gap-1 md:gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {landPriceData.map((data) => (
                    <button
                      key={data.year}
                      onClick={() => setSelectedYear(data.year)}
                      onMouseEnter={() => setHoveredData(data)}
                      onMouseLeave={() => setHoveredData(null)}
                      className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-all whitespace-nowrap text-xs md:text-sm ${
                        selectedYear === data.year
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {data.year}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Interactive Chart Visualization - Fixed height */}
            <div className="relative h-48 md:h-80 mb-6 md:mb-8">
              {/* Chart Bars */}
              <div className="absolute inset-0 flex items-end px-1">
                {landPriceData.map((data) => {
                  const heightPercentage = (data.price / maxPrice) * 80; // 80% max height for spacing
                  const isSelected = selectedYear === data.year;
                  const isHovered = hoveredData?.year === data.year;
                  
                  return (
                    <div
                      key={data.year}
                      className="flex-1 flex flex-col items-center px-0.5 md:px-1"
                      onMouseEnter={() => setHoveredData(data)}
                      onMouseLeave={() => setHoveredData(null)}
                      onClick={() => setSelectedYear(data.year)}
                    >
                      {/* Interactive Bar */}
                      <div className="relative w-6 md:w-10 lg:w-12 group cursor-pointer">
                        {/* Bar Background - Only for hover effect */}
                        <div className="absolute inset-0 bg-gray-100 rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        {/* Main Bar */}
                        <div
                          className={`relative rounded-t-lg transition-all duration-300 ${
                            isSelected
                              ? 'bg-gradient-to-t from-blue-600 to-blue-500'
                              : isHovered
                              ? 'bg-gradient-to-t from-blue-500 to-blue-400'
                              : 'bg-gradient-to-t from-blue-400 to-blue-300'
                          } ${isSelected || isHovered ? 'shadow-lg' : 'shadow'}`}
                          style={{ height: `${heightPercentage}%` }}
                        >
                          {/* Price on hover/select */}
                          {(isSelected || isHovered) && (
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded-md text-xs whitespace-nowrap">
                              <div className="font-bold">₹{data.price.toLocaleString()}</div>
                              <div className="text-xs opacity-75">{data.growth}% growth</div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Year Label */}
                      <div className="mt-2 text-xs md:text-sm font-medium text-gray-600">
                        {data.year}
                      </div>
                      
                      {/* Growth Indicator */}
                      <div className={`text-[10px] md:text-xs mt-0.5 font-medium ${
                        data.growth > 20 ? 'text-green-600' : 
                        data.growth > 15 ? 'text-green-500' : 'text-blue-500'
                      }`}>
                        ↑{data.growth}%
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chart Legend */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs md:text-sm text-gray-500">
                <span>2018: ₹4,500</span>
                <span>2026: ₹21,000</span>
              </div>
            </div>

            {/* Current Year Highlight - Compact on mobile */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg md:rounded-xl p-4 md:p-6 border border-blue-100">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 md:gap-3 mb-2">
                    <div className="p-1.5 md:p-2 bg-blue-100 rounded-lg">
                      <Info className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                    </div>
                    <h3 className="text-base md:text-xl font-bold text-gray-900">
                      {currentData.year} Analysis
                    </h3>
                  </div>
                  <p className="text-sm md:text-base text-gray-600">
                    <span className="font-bold text-green-600">{currentData.growth}% growth</span> this year - 
                    {currentData.label}
                  </p>
                </div>
                <div className="text-center bg-white px-4 py-2 md:px-6 md:py-3 rounded-lg border border-blue-200">
                  <div className="text-xl md:text-3xl font-bold text-blue-600">
                    ₹{currentData.price.toLocaleString()}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600">Current Price</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Investment Calculator - Responsive grid */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl md:rounded-2xl p-4 md:p-8 text-white mb-8 md:mb-12">
          <h2 className="text-xl md:text-3xl font-bold mb-4 md:mb-6 text-center">
            Your Investment Today
          </h2>
          
          <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-3'} gap-3 md:gap-6 mb-6 md:mb-8`}>
            {investments.map((investment) => {
              const returns = calculateInvestment(investment.amount);
              
              return (
                <div key={investment.amount} 
                  className="bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-6 border border-white/20 hover:border-white/40 transition-colors">
                  <div className="text-center mb-3 md:mb-4">
                    <div className="text-lg md:text-2xl font-bold">{investment.label}</div>
                    <div className="text-xs md:text-sm text-blue-200">Invested in 2018</div>
                  </div>
                  
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs md:text-sm text-blue-200">Area</span>
                      <span className="text-sm md:text-base font-bold">{returns.area} sq ft</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs md:text-sm text-blue-200">Current Value</span>
                      <span className="text-sm md:text-base font-bold">₹{returns.currentValue}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs md:text-sm text-blue-200">Profit</span>
                      <span className="text-sm md:text-base font-bold text-green-300">₹{returns.profit}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 md:pt-3 border-t border-white/20">
                      <span className="text-xs md:text-sm text-blue-200">ROI</span>
                      <span className="text-lg md:text-2xl font-bold text-green-300">{returns.roi}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <p className="text-sm md:text-base text-blue-100 mb-4 md:mb-6">
              Based on actual market growth. See what your investment could become!
            </p>
            <button className="bg-white text-blue-700 px-4 md:px-8 py-2 md:py-3 rounded-lg font-bold text-sm md:text-lg hover:bg-blue-50 transition-colors inline-flex items-center gap-1 md:gap-2">
              Start Investing
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>

        {/* Why Invest Section - Compact on mobile */}
        <div className="mb-8 md:mb-12">
          <h2 className="text-xl md:text-3xl font-bold text-gray-900 text-center mb-4 md:mb-8">
            Why Bengaluru East?
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {[
              {
                icon: <TrendingUp className="w-4 h-4 md:w-6 md:h-6" />,
                title: "High Growth",
                description: "23.2% average annual returns",
                color: "green"
              },
              {
                icon: <Shield className="w-4 h-4 md:w-6 md:h-6" />,
                title: "Safe",
                description: "Backed by major projects",
                color: "blue"
              },
              {
                icon: <Home className="w-4 h-4 md:w-6 md:h-6" />,
                title: "High Demand",
                description: "IT corridor expansion",
                color: "purple"
              },
              {
                icon: <Award className="w-4 h-4 md:w-6 md:h-6" />,
                title: "Future Ready",
                description: "Metro & airport access",
                color: "orange"
              }
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-lg md:rounded-xl p-3 md:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className={`p-2 md:p-3 rounded-lg bg-${item.color}-100 inline-block mb-2 md:mb-4`}>
                  <div className={`text-${item.color}-600`}>
                    {item.icon}
                  </div>
                </div>
                <h3 className="text-base md:text-xl font-bold text-gray-900 mb-1 md:mb-2">{item.title}</h3>
                <p className="text-xs md:text-base text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action - Compact on mobile */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl md:rounded-2xl p-4 md:p-8 text-white">
            <h2 className="text-xl md:text-3xl font-bold mb-3 md:mb-4">Don't Miss Out!</h2>
            <p className="text-sm md:text-xl mb-4 md:mb-6 max-w-2xl mx-auto px-2">
              Prices expected to reach ₹21,000/sq ft by 2026. Invest now before it's too late.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 md:gap-4 justify-center">
              <button className="bg-white text-green-700 px-4 md:px-8 py-2 md:py-3 rounded-lg font-bold text-sm md:text-lg hover:bg-green-50 transition-colors inline-flex items-center justify-center gap-1 md:gap-2">
                Book Site Visit
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button className="bg-transparent border border-white text-white px-4 md:px-8 py-2 md:py-3 rounded-lg font-bold text-sm md:text-lg hover:bg-white/10 transition-colors">
                Get Guide
              </button>
            </div>
            <p className="text-green-200 mt-4 md:mt-6 text-xs md:text-sm">
              Limited plots in Whitefield, Marathahalli, KR Puram
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 md:mt-12 text-center text-gray-500 text-xs md:text-sm px-2">
          <p>
            *Based on 2018-2024 market data. Future projections are estimates. Consult financial advisors.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BengaluruEastLandPriceChart;