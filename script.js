let currentUser = localStorage.getItem("currentUser") ||"";

let currentBlogIndex = null;
let tags = []; 


/* ---------------- AUTHENTICATION ---------------- */

function register(){

let user = document.getElementById("username").value;
let pass = document.getElementById("password").value;

if(user=="" || pass==""){
alert("Fill all fields");
return;
}

let users = JSON.parse(localStorage.getItem("users")) || [];

let exists = users.find(u=>u.username===user);

if(exists){
alert("User already exists");
return;
}

users.push({username:user,password:pass});

localStorage.setItem("users",JSON.stringify(users));

alert("Registered Successfully");
}


function login(){

let user=document.getElementById("username").value;
let pass=document.getElementById("password").value;

let users = JSON.parse(localStorage.getItem("users")) || [];

let valid = users.find(u=>u.username===user && u.password===pass);

if(!valid){
alert("Invalid login");
return;
}

localStorage.setItem("currentUser",user);

document.getElementById("loginSection").style.display="none";
document.getElementById("dashboardSection").style.display="block";

}


function logout(){
localStorage.removeItem("currentUser");
location.reload();
}



/* ---------------- PAGE NAVIGATION ---------------- */

function showSection(section){

document.getElementById("homeSection").style.display="none";
document.getElementById("createSection").style.display="none";
document.getElementById("viewSection").style.display="none";

if(section=="home"){
document.getElementById("homeSection").style.display="block";
loadBlogs();
}

if(section=="create"){
document.getElementById("createSection").style.display="block";
}

if(section=="view"){
document.getElementById("viewSection").style.display="block";
}

}



/* ---------------- SAVE BLOG ---------------- */

function saveBlog(){

let author = localStorage.getItem("currentUser");

let title = document.getElementById("title").value;
let content = document.getElementById("contentEditor").innerHTML;
let category = document.getElementById("category").value;
let image = document.getElementById("image").files[0];

let date = new Date().toLocaleDateString();

if(title=="" || content==""){
alert("Fill all fields");
return;
}

/* ⭐ Calculate reading time BEFORE saving */
let words = content.replace(/<[^>]*>/g,"").split(/\s+/).length;
let readingTime = Math.ceil(words/200);

let reader = new FileReader();

reader.onload=function(e){

let blogs = JSON.parse(localStorage.getItem("blogs")) || [];

blogs.push({
author:author,
title:title,
content:content,
category:category,
image:e.target.result,

tags:tags,              // ⭐ tag chips saved
readingTime:readingTime,// ⭐ reading time saved

likes:0,
views:0,
date:date,
comments:[]
});

localStorage.setItem("blogs",JSON.stringify(blogs));

alert("Blog Published 🚀");

document.getElementById("title").value="";
document.getElementById("contentEditor").innerHTML="";
document.getElementById("image").value="";
showSection("home");

};

if(image){
reader.readAsDataURL(image);
}else{
reader.onload({target:{result:""}});
}



}



/* ---------------- LOAD BLOGS ---------------- */

function loadBlogs(){

let blogs = JSON.parse(localStorage.getItem("blogs")) || [];

let container = document.getElementById("blogContainer");

container.innerHTML="";

blogs.forEach((blog,index)=>{

let card = document.createElement("div");   // ⭐ MISSING LINE
card.className="blog-card";

let imageHTML = "";

if(blog.image && blog.image !== ""){
imageHTML = `<img src="${blog.image}" class="blog-img">`;
}

let buttons = "";

if(blog.author === localStorage.getItem("currentUser")){
buttons = `
<button onclick="editBlog(${index})">Edit</button>
<button onclick="deleteBlog(${index})">Delete</button>
`;
}

card.innerHTML=`

${imageHTML}

<h3>${blog.title}</h3>

<p class="category">${blog.category}</p>

<p><b>Author:</b> ${blog.author}</p>

<p><b>Date:</b> ${blog.date}</p>

<p>${blog.content.substring(0,80)}...</p>

<p>❤️ ${blog.likes || 0} Likes | 👁 ${blog.views || 0} Views</p>

<div class="card-buttons">

<button onclick="viewBlog(${index})">Read</button>
<button onclick="likeBlog(${index})">Like</button>

${buttons}

</div>
`;

container.appendChild(card);

});

}


/* ---------------- VIEW BLOG ---------------- */

function viewBlog(index){

let blogs = JSON.parse(localStorage.getItem("blogs")) || [];

currentBlogIndex = index;

blogs[index].views = (blogs[index].views || 0) + 1;

localStorage.setItem("blogs", JSON.stringify(blogs));

document.getElementById("viewTitle").innerText = blogs[index].title;
document.getElementById("viewContent").innerHTML =
blogs[index].content.replace(/\n/g,"<br><br>");

let img = document.getElementById("viewImage");

if(blogs[index].image && blogs[index].image !== ""){
img.src = blogs[index].image;
img.style.display = "block";
}else{
img.style.display = "none";
}

document.getElementById("viewAuthor").innerText = "Author: " + blogs[index].author;
document.getElementById("viewDate").innerText = "Published: " + blogs[index].date;
document.getElementById("viewLikes").innerText = "❤️ " + blogs[index].likes + " Likes";

loadComments();

showSection("view");
document.getElementById("viewReadingTime").innerText =
blogs[index].readingTime+" min read";

let tagBox=document.getElementById("viewTags");

tagBox.innerHTML="";

blogs[index].tags.forEach(tag=>{
let span=document.createElement("span");
span.className="tag-badge";
span.innerText=tag;
tagBox.appendChild(span);
});
}



/* ---------------- DELETE BLOG ---------------- */

function deleteBlog(index){

let blogs = JSON.parse(localStorage.getItem("blogs"));

if(blogs[index].author !== localStorage.getItem("currentUser")){
alert("You cannot delete another author's blog.");
return;
}

blogs.splice(index,1);

localStorage.setItem("blogs", JSON.stringify(blogs));

loadBlogs();
}



/* ---------------- EDIT BLOG ---------------- */

function editBlog(index){

let blogs = JSON.parse(localStorage.getItem("blogs"));

if(blogs[index].author !== localStorage.getItem("currentUser")){
alert("You cannot edit another author's blog.");
return;
}

document.getElementById("title").value = blogs[index].title;
document.getElementById("contentEditor").innerHTML = blogs[index].content;
document.getElementById("category").value = blogs[index].category;

blogs.splice(index,1);

localStorage.setItem("blogs", JSON.stringify(blogs));

showSection("create");
}



/* ---------------- LIKE BLOG ---------------- */

function likeBlog(index){

let blogs = JSON.parse(localStorage.getItem("blogs"));

blogs[index].likes = (blogs[index].likes || 0) + 1;

localStorage.setItem("blogs", JSON.stringify(blogs));

loadBlogs();

}



/* ---------------- COMMENTS ---------------- */

function addComment(){

let text = document.getElementById("commentInput").value;

if(text=="") return;

let blogs = JSON.parse(localStorage.getItem("blogs"));

if(!blogs[currentBlogIndex].comments){
blogs[currentBlogIndex].comments=[];
}

blogs[currentBlogIndex].comments.push(text);

localStorage.setItem("blogs", JSON.stringify(blogs));

document.getElementById("commentInput").value="";

loadComments();
}


function loadComments(){

let blogs = JSON.parse(localStorage.getItem("blogs"));

let comments = blogs[currentBlogIndex].comments || [];

let list = document.getElementById("commentList");

list.innerHTML="";

comments.forEach(c=>{

let p=document.createElement("p");

p.innerText="💬 "+c;

list.appendChild(p);

});
}



/* ---------------- SEARCH ---------------- */

function searchBlogs(){

let input=document.getElementById("searchInput").value.toLowerCase();

let cards=document.querySelectorAll(".blog-card");

cards.forEach(card=>{

let title=card.querySelector("h3").innerText.toLowerCase();

card.style.display=title.includes(input)?"block":"none";

});
}



/* ---------------- FILTER ---------------- */

function filterCategory(){

let selected=document.getElementById("filterCategory").value;

let blogs=JSON.parse(localStorage.getItem("blogs"))||[];

let container=document.getElementById("blogContainer");

container.innerHTML="";

blogs.forEach((blog,index)=>{

if(selected=="all"||blog.category==selected){

let card=document.createElement("div");

card.className="blog-card";

card.innerHTML=`

<h3>${blog.title}</h3>

<p>${blog.content.substring(0,80)}...</p>

<button onclick="viewBlog(${index})">Read</button>

`;

container.appendChild(card);

}

});

}



/* ---------------- DARK MODE ---------------- */

function toggleDarkMode(){
document.body.classList.toggle("dark");
}



/* ---------------- STATS ---------------- */

function loadStats(){

let blogs = JSON.parse(localStorage.getItem("blogs")) || [];

document.getElementById("totalBlogs").innerText = blogs.length;

let likes = blogs.reduce((sum,b)=>sum+(b.likes||0),0);

let views = blogs.reduce((sum,b)=>sum+(b.views||0),0);

document.getElementById("totalLikes").innerText = likes;
document.getElementById("totalViews").innerText = views;

}



/* ---------------- TRENDING BLOGS ---------------- */

function loadTrendingBlogs(){

let blogs = JSON.parse(localStorage.getItem("blogs")) || [];

let container = document.getElementById("trendingContainer");

if(!container) return;

container.innerHTML="";

let sorted = [...blogs].sort((a,b)=>b.likes-a.likes).slice(0,3);

sorted.forEach(blog=>{

let card=document.createElement("div");

card.className="blog-card";

let imgHTML = "";

if(blog.image && blog.image !== ""){
imgHTML = `<img src="${blog.image}" class="blog-img">`;
}

card.innerHTML=`

${imgHTML}

<h3>${blog.title}</h3>

<p>❤️ ${blog.likes} Likes</p>

<p>${blog.content.substring(0,60)}...</p>

`;

container.appendChild(card);

});

}



/* ---------------- SHARE ---------------- */

function shareBlog(){

let title = document.getElementById("viewTitle").innerText;

navigator.clipboard.writeText(title);

alert("Blog title copied. Share it with friends!");

}



/* ---------------- MY BLOGS ---------------- */

function showMyBlogs(){

let user = localStorage.getItem("currentUser");

let blogs = JSON.parse(localStorage.getItem("blogs")) || [];

let container = document.getElementById("blogContainer");

container.innerHTML = "";

/* hide other sections */
document.getElementById("homeSection").style.display = "block";
document.getElementById("createSection").style.display = "none";
document.getElementById("viewSection").style.display = "none";

blogs.forEach((blog,index)=>{

if(blog.author === user){

let card = document.createElement("div");
card.className = "blog-card";

let imgHTML = "";

if(blog.image && blog.image !== ""){
imgHTML = `<img src="${blog.image}" class="blog-img">`;
}

card.innerHTML = `

${imgHTML}

<h3>${blog.title}</h3>

<p class="category">${blog.category}</p>

<p><b>Date:</b> ${blog.date}</p>

<p>${blog.content.substring(0,80)}...</p>

<p>❤️ ${blog.likes || 0} Likes | 👁 ${blog.views || 0} Views</p>

<div class="card-buttons">

<button onclick="viewBlog(${index})">Read</button>
<button onclick="editBlog(${index})">Edit</button>
<button onclick="deleteBlog(${index})">Delete</button>

</div>

`;

container.appendChild(card);

}

});

}



/* ---------------- PAGE LOAD ---------------- */

window.onload=function(){

let user = localStorage.getItem("currentUser");

if(user){
document.getElementById("loginSection").style.display="none";
document.getElementById("dashboardSection").style.display="block";
}

loadBlogs();
loadTrendingBlogs();
loadStats();

}
function previewImage(event){

const reader = new FileReader();

reader.onload = function(){

const img = document.getElementById("imagePreview");

img.src = reader.result;
img.style.display = "block";

};

reader.readAsDataURL(event.target.files[0]);

}
function formatText(command,value=null){
document.execCommand(command,false,value);
}

function addLink(){
let url=prompt("Enter URL");
if(url){
document.execCommand("createLink",false,url);
}
}



window.addEventListener("DOMContentLoaded",function(){

let tagInput=document.getElementById("tagInput");

if(tagInput){

tagInput.addEventListener("keydown",function(e){

if(e.key==="Enter"){

e.preventDefault();

let tag=this.value.trim();

if(tag!==""){

tags.push(tag);

let chip=document.createElement("span");
chip.className="tag-chip";
chip.innerText=tag;

document.getElementById("tagContainer").appendChild(chip);

this.value="";
}

}

});

}

});



let dropArea=document.getElementById("dropArea");

dropArea.addEventListener("dragover",(e)=>{
e.preventDefault();
});

dropArea.addEventListener("drop",(e)=>{
e.preventDefault();

let file=e.dataTransfer.files[0];

previewFile(file);
});

dropArea.onclick=function(){
document.getElementById("image").click();
};


function previewFile(file){

let reader=new FileReader();

reader.onload=function(e){
document.getElementById("imagePreview").src=e.target.result;
};

reader.readAsDataURL(file);

}

function viewProfile(author){

let blogs=JSON.parse(localStorage.getItem("blogs"))||[];

document.getElementById("profileName").innerText=author+"'s Blogs";

let container=document.getElementById("profileBlogs");

container.innerHTML="";

blogs.forEach((b,i)=>{

if(b.author===author){

container.innerHTML+=`
<div class="blog-card">
<h3>${b.title}</h3>
<button onclick="viewBlog(${i})">Read</button>
</div>
`;

}

});

showSection("profile");

}


function toggleTheme(){

let body=document.body;

body.classList.toggle("light");

let btn=document.getElementById("themeBtn");

if(body.classList.contains("light")){
btn.innerText="🌙 Dark";
}else{
btn.innerText="☀ Light";
}

}