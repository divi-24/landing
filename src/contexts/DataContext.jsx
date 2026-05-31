import React, { createContext, useContext, useState, useCallback } from 'react';
import CollectionService from '../core/services/CollectionService';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const [collections, setCollections] = useState([]);
    const [collectionsLoading, setCollectionsLoading] = useState(false);

    // Fetch collections from API
    const fetchCollections = useCallback(async () => {
        try {
            setCollectionsLoading(true);
            const data = await CollectionService.getCollections();
            // Sort by createdAt descending (newest first)
            const sortedCollections = (data || []).sort((a, b) => {
                const dateA = new Date(a.createdAt || 0);
                const dateB = new Date(b.createdAt || 0);
                return dateB - dateA;
            });
            setCollections(sortedCollections);
            return sortedCollections;
        } catch (error) {
            console.error('Failed to fetch collections:', error);
            return [];
        } finally {
            setCollectionsLoading(false);
        }
    }, []);

    // Add a new collection to the list (optimistic update)
    const addCollection = useCallback((newCollection) => {
        setCollections(prev => [newCollection, ...prev]);
    }, []);

    // Remove a collection from the list
    const removeCollection = useCallback((collectionId) => {
        setCollections(prev => prev.filter(c => c._id !== collectionId && c.id !== collectionId));
    }, []);

    // Update a collection in the list
    const updateCollection = useCallback((collectionId, updatedData) => {
        setCollections(prev => prev.map(c =>
            (c._id === collectionId || c.id === collectionId)
                ? { ...c, ...updatedData }
                : c
        ));
    }, []);

    const value = {
        collections,
        collectionsLoading,
        fetchCollections,
        addCollection,
        removeCollection,
        updateCollection,
        setCollections
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};
