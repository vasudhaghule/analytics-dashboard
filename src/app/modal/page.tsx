'use client';

import { useState } from 'react';
import Modal from '@/components/Modal';

export default function ModalPage() {
  const [isOpen, setIsOpen] = useState(false);
  const varFiltersCg = 'Modal Content';

  return (
    <div className="container mx-auto p-4">
      <button
        onClick={() => setIsOpen(true)}
        className="rounded bg-primary px-4 py-2 text-white hover:bg-primary/90"
        id="open-modal-btn"
      >
        Open Modal
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <p className="text-lg">{varFiltersCg}</p>
      </Modal>
    </div>
  );
} 