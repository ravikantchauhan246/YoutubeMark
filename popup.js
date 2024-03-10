import { getActiveTabURL } from "./utils.js";
// adding a new bookmark row to the popup
const addNewBookmark = (bookmarksElement,bookmark) => {
    const bookmarkTitleElement= document.createElement("div");
    const newBookmarkElement= document.createElement("div");
    const controlsElement= document.createElement("div");

    bookmarkTitleElement.textContent = bookmark.desc;
    bookmarkTitleElement.className = "bookmark-title";

    controlsElement.className="bookmark-controls";
    


    newBookmarkElement.id="bookmark-"+bookmark.time;
    newBookmarkElement.className = "bookmark";
    newBookmarkElement.setAttribute("timestamp",bookmark.time);

    setBookmarkAttributes("play",onPlay,controlsElement);
    setBookmarkAttributes("delete",onDelete,controlsElement);

    

    newBookmarkElement.appendChild(bookmarkTitleElement);
    newBookmarkElement.appendChild(controlsElement);
    bookmarksElement.appendChild(newBookmarkElement);

};

const viewBookmarks = (currentBookmarks=[]) => {
    const bookmarksElement = document.getElementById("bookmarks");
    bookmarksElement.innerHTML="";
    if(currentBookmarks.length>0){
        for(let i=0; i<currentBookmarks.length; i++){
            const bookmark = currentBookmarks[i];
            addNewBookmark(bookmarksElement,bookmark);
        }
    }
    else{
        bookmarksElement.innerHTML = "<h1>No bookmarks found</h1>";
    }
};

const onPlay = async e => {
const bookmarkTime=e.target.parentNode.parentNode.getAttribute("timestamp");
const activeTab = await getActiveTabURL();
chrome.tabs.sendMessage(activeTab.id,{
    type:"Play",
    value:bookmarkTime
}
    
    );
};

const onDelete = async e => {
    const activeTab = await getActiveTabURL();
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    const bookmarksElementToDelete= document.getElementById("bookmark-"+bookmarkTime);
    
    bookmarksElementToDelete.parentNode.removeChild(bookmarksElementToDelete);
    chrome.tabs.sendMessage(activeTab.id,{
        type: "Delete",
        value: bookmarkTime
    },viewBookmarks);
};

const setBookmarkAttributes =  (src,eventListener,controlParentElement) => {
    const controlElement = document.createElement("img");

    controlElement.src="assets/"+src+".png";
    controlElement.title=src;
    controlElement.addEventListener("click",eventListener);
    controlParentElement.appendChild(controlElement);
};

document.addEventListener("DOMContentLoaded", async () => {
    const activeTab = await getActiveTabURL();
    const queryParameters=activeTab.url.split("?")[1];
    const urlParameters= new URLSearchParams(queryParameters);
    const currentVideo = urlParameters.get("v");


    if(activeTab.url.includes("youtube.com/watch") && currentVideo){
        chrome.storage.sync.get([currentVideo],(data)=>{
            const currentVideoBookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]) : [];
            
            //viewBookmarks
            viewBookmarks(currentVideoBookmarks);

        })

    } else{
        const container = document.getElementById("container");
        container.innerHTML = "<h1>Open a youtube video to start bookmarking</h1>"
    }
    
});
