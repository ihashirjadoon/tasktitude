import React, { useState } from 'react';
import { Calendar, BookOpen, Car, Home, Gamepad, Dumbbell } from 'lucide-react';
import Image from 'next/image';

const TaskitudeUI = () => {
  const [selectedCategory, setSelectedCategory] = useState('Study');
  const [duration, setDuration] = useState(30);

  const categories = [
    { name: 'Study', icon: <BookOpen className="w-4 h-4" />, color: 'bg-red-500' },
    { name: 'Work Out', icon: <Dumbbell className="w-4 h-4" />, color: 'bg-purple-500' },
    { name: 'Homework', icon: <Home className="w-4 h-4" />, color: 'bg-blue-500' },
    { name: 'Relaxation', icon: <Calendar className="w-4 h-4" />, color: 'bg-yellow-500' },
    { name: 'Gaming', icon: <Gamepad className="w-4 h-4" />, color: 'bg-green-500' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-1/3 bg-white p-6 shadow-lg border-r border-gray-200">
        <div className="flex items-center mb-8">
          <div className="p-2 rounded-lg mr-2">
            <Image 
              src="/images/tasktitudelogo.svg" 
              alt="Logo" 
              width={50} 
              height={50} 
              className="w-10 h-10 text-blue-600" 
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Taskitude</h1>
        </div>
        
        <input 
          type="text" 
          placeholder="What's happening today?"
          className="w-full p-2 mb-4 border rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200"
        />
        
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <button
              key={category.name}
              className={`flex items-center px-3 py-1 rounded-full text-sm transition-all duration-200 transform hover:scale-105 ${category.color} text-white`}
              onClick={() => setSelectedCategory(category.name)}
            >
              {category.icon}
              <span className="ml-1">{category.name}</span>
            </button>
          ))}
        </div>
        
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-2 text-gray-700">When Will You Be Working?</h3>
          <div className="flex gap-2">
            <input type="time" className="border rounded-full px-2 py-1 w-24 focus:border-blue-500 focus:ring focus:ring-blue-200" />
            <input type="time" className="border rounded-full px-2 py-1 w-24 focus:border-blue-500 focus:ring focus:ring-blue-200" />
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-2 text-gray-700">How Long Do You Think This Will Take?</h3>
          <p className="text-xs text-gray-500 mb-2">We'll do this for you if you don't know 😊</p>
          <input
            type="range"
            min="0"
            max="120"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            className="w-full accent-blue-500"
          />
          <p className="text-sm text-right text-gray-700">{duration} minutes</p>
        </div>
        
        <button className="w-full bg-blue-500 text-white py-2 rounded-full transition-all duration-200 transform hover:scale-105 mb-4">Add</button>
        <button className="w-full border border-blue-500 text-blue-500 py-2 rounded-full transition-all duration-200 transform hover:scale-105">Regenerate</button>
      </div>
      
      {/* Right Content */}
      <div className="flex-1 p-6 bg-gray-50">
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 flex items-start border border-gray-200">
            <div className="bg-blue-500 p-2 rounded-lg mr-4 mt-1">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="flex-grow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-800">Study for Chemistry</h3>
                  <p className="text-sm text-gray-500">Ready for the Day</p>
                  <p className="text-sm text-gray-500">6:00 - 7:00 AM</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full mb-2">Education</span>
                  <button className="text-xs text-blue-500 transition-all duration-200 transform hover:scale-105">Add to Google Calendar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-lg shadow-md p-4 flex items-start border border-gray-200">
            <div className="bg-green-500 p-2 rounded-lg mr-4 mt-1">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div className="flex-grow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-800">Leave for School</h3>
                  <p className="text-sm text-gray-500">Time to Drive</p>
                  <p className="text-sm text-gray-500">7:45 - 8:20 AM</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full mb-2">Transport</span>
                  <button className="text-xs text-blue-500 transition-all duration-200 transform hover:scale-105">Add to Google Calendar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskitudeUI;
