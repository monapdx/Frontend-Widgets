(function(){

let tooltip;

function showTooltip(el){
  const text = el.dataset.tooltip;
  if(!text) return;

  tooltip = document.createElement("div");
  tooltip.className="fw-tooltip";
  tooltip.textContent=text;

  document.body.appendChild(tooltip);

  const rect = el.getBoundingClientRect();
  const tt = tooltip.getBoundingClientRect();

  tooltip.style.left = rect.left + rect.width/2 - tt.width/2 + "px";
  tooltip.style.top = rect.top - tt.height - 8 + window.scrollY + "px";

  requestAnimationFrame(()=>tooltip.classList.add("is-visible"));
}

function hideTooltip(){
  if(!tooltip) return;
  tooltip.remove();
  tooltip=null;
}

document.addEventListener("mouseenter",e=>{
  const el=e.target.closest("[data-tooltip]");
  if(el) showTooltip(el);
},true);

document.addEventListener("mouseleave",e=>{
  if(e.target.closest("[data-tooltip]")) hideTooltip();
},true);

})();