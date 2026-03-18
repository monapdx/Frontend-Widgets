document.querySelectorAll(".fw-dropzone").forEach(zone=>{

zone.addEventListener("dragover",e=>{
e.preventDefault();
zone.classList.add("is-drag");
});

zone.addEventListener("dragleave",()=>{
zone.classList.remove("is-drag");
});

zone.addEventListener("drop",e=>{
e.preventDefault();
zone.classList.remove("is-drag");

const files=e.dataTransfer.files;

console.log(files);
zone.innerHTML=`${files.length} file(s) dropped`;
});

});