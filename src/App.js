import { useEffect, useRef, useState } from "react";
import { SongList } from "./components/songList";
import spotify from "./lib/spotify";
import { Player } from "./components/Player";
import { SearchInput } from "./components/SerchInput";
import { Pagination } from "./components/Pagination";

const limit = 20;

export default function App() {
  const [isLoading,setIsLoading] = useState(false);
  const [popularSong,setPopularSong] = useState([])
  const [isPlay,setIsPlay] = useState(false)
  const [selectedSong,setSelectedSong] =useState()
  const [keyword,setKeyword] = useState("")
  const [searchedSongs,setSearchedSongs] = useState()
  const [page,setPage] =useState(1)
  const audioRef = useRef(null)

  useEffect(()=>{
    fetchPopularSongs()
  },[])

  const fetchPopularSongs = async () =>{
    setIsLoading(true)
    const result =await spotify.getPopularSongs()
    const popularSongs = result.items.map((item)=>{
      return item.track
    })
    setPopularSong(popularSongs)
    setIsLoading(false)
  }

  const handleSongSlect = async(song)=>{
    setSelectedSong(song)
    if (song.preview_url != null){
    audioRef.current.src = song.preview_url;
    playSong()}else{
      pauseSong();
    }
  }

  const playSong = () =>{
    audioRef.current.play()
    setIsPlay(true)
  }

  const pauseSong = ()=>{
    audioRef.current.pause()
    setIsPlay(false)
  }

  const toggleSong = () => {
    if(isPlay){
      pauseSong();
    }else{
      playSong();
    }
  }

  const handleInputChange = (e) =>{
    setKeyword(e.target.value);
  }

  const searchSongs = async(page)=>{
    setIsLoading(true)
    const offset = parseInt(page) ? (parseInt(page) - 1) * limit : 0;
    const result = await spotify.searchSongs(keyword,limit,offset);
    setSearchedSongs(result.items);
    setIsLoading(false)
  }
  
  const moveToNext = async()=>{
    const nextPage = page +1
    await searchSongs(nextPage)
    setPage(nextPage)
  }

  const moveToPrev = async()=>{
    const nextPrev = page -1
    await searchSongs(nextPrev)
    setPage(nextPrev)
  }
  const isSearchedResult = searchedSongs != null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <main className="flex-1 p-8 mb-20">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold">Music App</h1>
        </header>
        <SearchInput onInputChange={handleInputChange} onSubmit={searchSongs} />
        <section>
          <h2 className="text-2xl font-semibold mb-5">{isSearchedResult ? "Searched Result" : "Popular Songs"}</h2>
          <SongList isLoading={isLoading} songs={isSearchedResult ? searchedSongs :popularSong} onSongSelected={handleSongSlect} />
        </section>
        {isSearchedResult && <Pagination onPrev={moveToPrev} onNext={moveToNext} />}
      </main>
      {selectedSong != null && <Player song={selectedSong} isPlay={isPlay} onButtonClick={toggleSong} />}
      <audio ref={audioRef}></audio>
    </div>
  );
}