import React, { useState, useEffect } from 'react';

const SearchBar = ({ onSearchSubmit, placeholder = "Search trials by condition, intervention, or gene mutation...", value = "" }) => {
    const [input, setInput] = useState(value);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        setInput(value);
    }, [value]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSearchSubmit) {
            onSearchSubmit(input);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <div 
                className={`flex items-center bg-surface-container-lowest border border-outline-variant rounded-xl p-unit pl-lg pr-unit transition-all duration-200 clinical-shadow ${
                    isFocused ? 'border-primary ring-2 ring-secondary/20 -translate-y-0.5' : 'translate-y-0'
                }`}
            >
                <span className="material-symbols-outlined text-outline mr-md select-none">search</span>
                <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-body-md py-md text-on-surface"
                />
                <button
                    type="submit"
                    className="bg-primary text-on-primary px-xl py-md rounded-lg font-label-md text-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors ml-md cursor-pointer whitespace-nowrap"
                >
                    Analyze
                </button>
            </div>
        </form>
    );
};

export default SearchBar;