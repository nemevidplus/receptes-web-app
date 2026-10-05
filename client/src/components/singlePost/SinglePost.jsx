import axios from "axios";
import { useEffect } from "react";
import "./singlePost.css";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useContext } from 'react';
import { Context } from '../../context/Context';

export default function SinglePost() {
const location = useLocation()
const path = location.pathname.split("/")[2];
const [post, setPost] = useState({})
const PF = "http://localhost:5001/images/";
const{user} = useContext(Context);
const [title, setTitle] = useState("");
const [desc, setDesc] = useState("");
const [updateMode, setUpdateMode] = useState(false); 



useEffect(() => {
  const getPost= async () => {
    const res = await axios.get("/posts/" + path);
    console.log(res)
    setPost(res.data);
    setTitle(res.data.title);
    setDesc(res.data.desc);
  };
  getPost()
}, [path]);

const handleDelete = async() => {

  try {
    await axios.delete(`/posts/${post._id}` ,{ data: {username : user.username}});
    window.location.replace("/");
  } catch(err){

  }
  
}

const handleUpdate = async ()  => {
  try {
    await axios.put(`/posts/${post._id}` ,{  username : user.username, title, desc});
    // window.location.reload();
    setUpdateMode(false)
  } catch(err){

  }
  // setUpdateMode(true);
}

  return (
    <div className="singlePost">
       <div className="singlePostWrapper">

       {post.photo && (      <img
          className="singlePostImg"
          src={PF + post.photo}
          alt=""
        />
        )}

        { updateMode ? (<input type="text" value ={title} onChange={(e) => setTitle(e.target.value)} className="singlePostTitleInput" autoFocus/>) : 
        
        ( <h1 className="singlePostTitle">
         {title}
         {post.username === user?.username &&
          <div className="singlePostEdit">
            <i className="singlePostIcon far fa-edit" onClick={()=> setUpdateMode(true)}></i>
            <i className="singlePostIcon far fa-trash-alt" onClick={handleDelete}></i>
          </div>}
        </h1>)}
       
        <div className="singlePostInfo">
          <span>
            Author:
            <b className="singlePostAuthor">
              <Link className="link" 
              to={`/?user=${post.username}`}  >
               <b>{post.username}</b> 
              </Link>
            </b>
          </span>
            {/* show categories for this post */}
        <div className="singlePostCats">
          {post.categories?.map((c) => (
            <span key={c} className="singlePostCat">{c}</span>
          ))}
        </div>
          <span>{new Date(post.createdAt).toLocaleDateString("hu-HU")}</span>
        </div>
        {updateMode ? ( <textarea className="singlePostDescInput" value={desc} onChange={(e) => setDesc(e.target.value)} autoFocus/>) : (  
          <p className="singlePostDesc">
          {desc}
          <br />
          <br />
        </p>
        )}

        {updateMode &&  <button className="singlePostButton" onClick={handleUpdate}>Update</button>}
     
      </div>
    </div>
  )
}
