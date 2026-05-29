import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin } from 'react-icons/fi';

const IssueCard = ({ issue }) => {
  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === 'ended' || s === 'resolved') {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    }
    return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'Garbage': return 'bg-yellow-500 text-white';
      case 'Illegal Construction': return 'bg-red-500 text-white';
      case 'Broken Public Property': return 'bg-purple-500 text-white';
      case 'Road Damage': return 'bg-gray-600 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  const placeholderImage = 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=600';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-700 flex flex-col h-full">
      <div className="relative h-[160px] overflow-hidden">
        <img 
          src={issue.image || placeholderImage} 
          onError={(e) => { e.target.onerror = null; e.target.src = placeholderImage; }}
          alt={issue.title} 
          className="w-full h-[160px] object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className={`absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider shadow-sm ${getStatusColor(issue.status)}`}>
          {issue.status || 'ongoing'}
        </div>
        {issue.category && (
          <div className={`absolute bottom-3 left-3 px-2 py-1 rounded-md text-xs font-semibold shadow-sm ${getCategoryColor(issue.category)}`}>
            {issue.category}
          </div>
        )}
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">{issue.title}</h3>
        
        {issue.location && (
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs mb-3">
            <FiMapPin className="mr-1 flex-shrink-0" />
            <span className="truncate">{issue.location}</span>
          </div>
        )}
        
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 flex-grow">
          {issue.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="text-lg font-extrabold text-[#1a3a2a] dark:text-[#d4ff00]">
            {issue.amount ? `${issue.amount} kr` : '0 kr'}
          </div>
          <Link 
            to={`/all-issues/${issue._id}`}
            className="px-4 py-2 bg-[#1a3a2a] text-white dark:bg-[#d4ff00] dark:text-[#1a3a2a] rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
          >
            See Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default IssueCard;
