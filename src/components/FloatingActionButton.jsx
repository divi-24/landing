import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import CreateCollectionModal from './CreateCollectionModal';
import '../styles/FloatingActionButton.css';

const FloatingActionButton = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    return (
        <>
            <button
                className="fab"
                onClick={() => setIsCreateModalOpen(true)}
                aria-label="Create Collection"
            >
                <Plus size={24} strokeWidth={2.5} />
            </button>

            <CreateCollectionModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </>
    );
};

export default FloatingActionButton;
