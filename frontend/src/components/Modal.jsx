import { motion } from 'framer-motion';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-md">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}
        className="relative bg-surface-container-lowest rounded-2xl p-lg w-full max-w-xl shadow-modal border border-outline-variant overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between mb-lg border-b border-outline-variant pb-sm">
          <h2 className="font-headline-md text-headline-md text-on-surface">{title}</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
};

export default Modal;
