(function(){

const palette=document.querySelector(".fw-command");

document.addEventListener("keydown",e=>{

if((e.ctrlKey||e.metaKey) && e.key==="k"){
e.preventDefault();
palette.classList.toggle("is-open");
}

if(e.key==="Escape") palette.classList.remove("is-open");

});

})();