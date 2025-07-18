import React from "react";
import { MagnifyingGlassIcon} from '@heroicons/react/24/outline'

export default function SearchBar(onAnalyze) {
   const [githubUrl, setGithubUrl] = React.useState('');

  const handleAnalyze = () => {
    if (githubUrl && onAnalyze) {
      onAnalyze(githubUrl);
      console.log("Analyzing:", githubUrl);
      setGithubUrl(''); // Clear input after submission
    }
  };
   return (
    <div className="flex w-full mx-auto">
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleAnalyze();
        }}
        className="flex w-full bg-white border border-gray-300 rounded-lg shadow-sm"
      >
      <MagnifyingGlassIcon className="mt-3 ml-3 w-5 h-5 text-gray-700" />
      <input 
        type="text" 
        placeholder="오픈소스 리포지터리 URL 검색..." 
        value={githubUrl}
        onChange={(e) => setGithubUrl(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleAnalyze();
          }
        }}
        className="flex-1 p-3 flex-grow bg-transparent text-xs lg:text-sm text-gray-700 placeholder-gray-400 outline-none"
      />
      </form>
      
    </div>
  );
}