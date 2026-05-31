import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import ProductFeed from '../components/ProductFeed';
import '../styles/Home.css';
import '../styles/Products.css';

const Products = () => (
    <motion.div
        className="products-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
    >
        <header className="products-hero">
            <Link to="/landing" className="products-back-link">
                <ArrowLeft size={16} />
                Back
            </Link>
            <div className="products-hero-copy">
                <span className="products-eyebrow">
                    <Sparkles size={14} />
                    Product showcase
                </span>
                <h1>Curated products ready to explore.</h1>
                <p>
                    Browse visual product drops inspired by Pinterest-style shopping boards. Each product opens into its own detail page.
                </p>
            </div>
        </header>

        <ProductFeed defaultTab="brand" />
    </motion.div>
);

export default Products;
