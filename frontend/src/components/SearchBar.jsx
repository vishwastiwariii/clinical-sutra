import React, { useState } from 'react'

const SearchBar = ({ onSearchSubmit, placeholder = "Type your Query"}) => {
    const [input, setInput] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault(); //prevents reloads

        if(onSearchSubmit){
            onSearchSubmit(input)
        }
    }

    return (
        <form onSubmit={handleSubmit} className='w-full'>
            <div className='relative flex items-center shadow-sm rounded-lg overflow-hidden border border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all bg-white'>
                <input 
                type='text'
                value = {input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={placeholder}
                className="w-full py-3 px-4 text-slate-700 outline-none placeholder-slate-400"
                />

                <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 font-medium transition-colors text-sm"
                >
                Search
                </button>
            </div>
        </form>
    )
}

export default SearchBar