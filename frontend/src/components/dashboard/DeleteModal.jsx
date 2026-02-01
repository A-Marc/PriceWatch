import React from "react";

const DeleteModal = ({ isOpen, onCancel, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-[60] p-4">
      <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-white/20 text-center animate-in fade-in zoom-in duration-200">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
          ⚠️
        </div>
        <h3 className="text-xl font-black dark:text-white mb-2">Are you sure?</h3>
        <p className="text-slate-500 dark:text-gray-400 text-sm mb-8">
          This item will be removed from your tracking list. You can't undo this action.
        </p>
        <div className="flex gap-3">
          <button 
            onClick={onCancel}
            className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-3 font-bold bg-red-600 text-white rounded-xl hover:bg-red-700 shadow-lg shadow-red-500/30 transition-all"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;